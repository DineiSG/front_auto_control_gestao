import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import "../Administracao.css";
import * as XLSX from "xlsx";

import { useState, useEffect, useRef } from "react";
import { useGetArray } from "../../../services/useGetArray";
import { formatDateInfo } from "../../../hooks/formatDate";
import { useFilterPeriodo } from "../../../hooks/useFilterPeriodo";

import Box from '../../../components/box/Box'
import Table from "../../../components/table/Table";
import Input from "../../../components/input/Input";
import Select from "../../../components/select/Select";
import Button from "../../../components/button/Button";
import ContainerSecundario from "../../../components/container/ContainerSecundario";
import RelatorioSaidas from "./RelatorioSaidas";

const RelatoriosMovimentacao = () => {

    const [filteredBaixas, setFilteredBaixas] = useState([]);
    const [filteredLiberacoes, setFilteredLiberacoes] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [select, setSelect] = useState(false);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [dataFont, setDataFont] = useState('')
    const tabelaRef = useRef(null);

    //Recebendo os veículos da tabela
    const { data: baixas = [] } = useGetArray(`/baixas`);

    const { data: liberacoes } = useGetArray(`/liberacoes`);

    const handleSelectChange = (e) => {
        setSelect(e.target.value);
        if (e.target.value === 'baixas') {
            setFilteredBaixas(baixas || []);
            setDataFont('baixas')
        }
        if (e.target.value === 'liberacoes') {
            setFilteredLiberacoes(liberacoes || []);
            setDataFont('liberacoes')
        }
    }

    const { startDate, endDate, setStartDate, setEndDate, filteredData, message, status, hasResults } = useFilterPeriodo({
        data: dataFont === 'baixas' ? baixas : liberacoes,
        dateKey: 'dataRegistro', // <-- ajuste para o nome da sua propriedade de data
    });

    //Essa função é responsável por filtrar os dados de acordo com o valor informado no input e renderizar o valor na tabela
    useEffect(() => {
        let filtrados = [...filteredData];

        if (searchTerm.trim() !== '') {
            const lower = searchTerm.toLowerCase();
            filtrados = filtrados.filter(v =>
                v.placa?.toLowerCase().includes(lower) ||
                v.unidade?.toLowerCase().includes(lower) ||
                v.motivo?.toLowerCase().includes(lower)

            );
        }


        // Ordena do mais recente para o mais antigo
        filtrados.sort((a, b) => {
            return new Date(b.dataRegistro) - new Date(a.dataRegistro);
        });

        setFilteredLiberacoes(filtrados)
        setFilteredBaixas(filtrados)
    }, [searchTerm, filteredData])


    //Passando as colunas com as suas respectivas chaves
    const colunas = [
        { key: 'unidade', label: 'LOJA' },
        { key: 'dataRegistro', label: 'DATA REGISTRO', format: (value) => formatDateInfo(value) /*Formatando a data para 00/00/00 */ },
        { key: 'marca', label: 'MARCA' },
        { key: 'modelo', label: 'MODELO' },
        { key: 'cor', label: 'COR' },
        { key: 'placa', label: 'PLACA' },
        { key: 'motivo', label: 'MOTIVO' },
        { key: 'solicitante', label: 'SOLICITANTE' }
        //{ key: 'renavan', label: 'RENAVAM' },
        //{ key: 'dias_estoque', label: 'DIAS EM ESTOQUE', format: (value) => value !== undefined ? `${value} dia(s)` : 'N/A' /*in */ },

    ]


    //Função que trata da paginação da tabela baixas
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredBaixas.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.ceil(filteredBaixas.length / pageSize);

    //Função que trata da paginação da tabela liberações
    const startIndexLiberacao = (currentPage - 1) * pageSize;
    const paginatedDataLiberacao = filteredLiberacoes.slice(startIndexLiberacao, startIndexLiberacao + pageSize);
    const totalPagesLiberacao = Math.ceil(filteredLiberacoes.length / pageSize);

    //Array de opções para o select
    const options = [
        { value: 10, label: '10' },
        { value: 20, label: '20' },
        { value: 30, label: '30' },
        { value: 50, label: '50' },
        { value: 1000, label: 'TODOS' },
    ];

    //Função que gera o Excel da tabela
    const gerarExcel = () => {
        let dataToExport = [];
        if (select === 'baixas') {
            dataToExport = filteredBaixas;
        } else if (select === 'liberacoes') {
            dataToExport = filteredLiberacoes;
        }

        const formattedData = dataToExport.map(filtrados => ({
            Loja: filtrados.unidade,
            Data_Registro: formatDateInfo(filtrados.dataRegistro), // aplica sua função de formatação
            Marca: filtrados.marca,
            Modelo: filtrados.modelo,
            Cor: filtrados.cor,
            Placa: filtrados.placa,
            Solicitante: filtrados.solicitante,
            Motivo: filtrados.motivo
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, `Relatorio de ${select === 'baixas' ? 'Baixas' : 'Liberacoes'}.xlsx`);
    };



    return (
        <ContainerSecundario >
            <div className='container d-flex flex-column ' id="path" >
                <div className="d-flex align-items-start ">
                    <div className="p-2">
                        <a className="link_a" href="/home">Gestão</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <a className="link_a" href="\administracao">Administração</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <p className='atual'>Relatórios de Baixas e Liberações </p>
                    </div>
                </div>
            </div>
            <div className="container d-flex justify-content-center card-container">
                <Box>
                    <div className='d-flex justify-content-between panel-heading'>
                        <div className="d-flex justify-content-start">
                            <div className="p-1 ">
                                <i className='ti ti-car' id="ti-black" ></i>
                            </div>
                            <div className="p-2 ">
                                <p>MOVIMENTAÇÕES DE VEÍCULOS</p>
                            </div>

                        </div>
                        <div className="d-flex justify-content-between">
                            <div className="p-2 ">
                                <select className="select-item" value={select} onChange={handleSelectChange} id="select-baixas">
                                    <option value='selecione'>Selecione uma opção</option>
                                    <option value='baixas'>Relatório de Baixas</option>
                                    <option value='liberacoes'>Relatório de Liberação</option>
                                    <option value='saidas'>Solicitações de Saida</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <br />

                    {select === 'baixas' && (
                        <>
                            <div className="d-flex flex-column align-items-end" >
                                <div className="d-flex align-items-center gap-3">
                                    {status !== "ok" && (<p className={status === "error" ? "text-danger" : "text-muted"} >{message} </p>)}
                                    <div className="d-flex flex-column ">
                                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} tooltipText="Data inicial"
                                            tooltipPlacement="top" />
                                    </div>
                                    <div className="d-flex flex-column">
                                        <Input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} tooltipText="Data final"
                                            tooltipPlacement="top" />
                                    </div>
                                    <div className="p-2">
                                        <div className="p-1 ">
                                            <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} options={options} className={"quantidade"} />
                                        </div>
                                    </div>
                                </div>
                                <div className=" d-flex justify-content-between" >
                                    {hasResults ? (
                                        <div className="p-2" >
                                            <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder={"Filtro"} id='criterios-pesquisa' tooltipText="Filtrar por placa, nome da loja ou motivo da baixa"
                                                tooltipPlacement="top" />
                                        </div>

                                    ) : null}
                                </div>
                            </div>
                            <br />
                            <div className="table-responsive" ref={tabelaRef}>
                                <div>
                                    <Table data={hasResults ? paginatedData : []} columns={colunas} className={"table table-striped table-bordered table-data dataTable no-footer"} role="grid" id="estoque" />
                                </div>
                            </div>

                            <div className="d-flex justify-content-between" id="pagination" >
                                <div className="p-2 ">
                                    <div className="d-flex justify-content-start">
                                        <Button onClick={gerarExcel} className="bg-blue-500 text-white px-4 py-2 rounded">
                                            GERAR EXCEL
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4 ">
                                    <p>
                                        <span>
                                            Mostrando página {currentPage} de {totalPages} | Total de registros: {filteredBaixas.length}
                                        </span>
                                    </p>
                                </div>

                                <div className="d-flex justify-content-end" >
                                    <div className="d-flex justify-content-between">
                                        <div className="p-2 ">
                                            <Button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} variant={currentPage === 1 ? 'disabled' : 'primary'} className={"px-3 py-1 bg-gray-300 rounded"} >
                                                <i className=' ti ti-angle-left px-3 py-1 bg-gray-300 rounded' id='card-path' />ANTERIOR
                                            </Button>
                                        </div>
                                        <div className="p-4 ">
                                            <p>
                                                <span>
                                                    {currentPage}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="p-2 ">
                                            <Button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={"px-3 py-1 bg-gray-300 rounded"} >
                                                PRÓXIMA <i className=' ti ti-angle-right px-3 py-1 bg-gray-300 rounded' />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {select === 'liberacoes' && (
                        <>
                            <div className="d-flex flex-column align-items-end" >
                                <div className="d-flex align-items-center gap-3">
                                    {status !== "ok" && (<p className={status === "error" ? "text-danger" : "text-muted"} >{message} </p>)}
                                    <div className="d-flex flex-column ">
                                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} tooltipText="Buscar por um veículo em uma data específica"
                                            tooltipPlacement="top" />
                                    </div>
                                    <div className="d-flex flex-column">
                                        <Input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} tooltipText="Buscar por um veículo em uma data específica"
                                            tooltipPlacement="top" />
                                    </div>
                                    <div className="p-2">
                                        <div className="p-1 ">
                                            <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} options={options} className={"quantidade"} />
                                        </div>
                                    </div>
                                </div>
                                <div className=" d-flex justify-content-between" >
                                    {hasResults ? (
                                        <div className="p-2" >
                                            <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                                                placeholder={"Filtro"} id='criterios-pesquisa' tooltipText="Filtrar por placa, nome da loja ou motivo da liberação"
                                                tooltipPlacement="top" />
                                        </div>
                                    ) : null}

                                </div>
                            </div>
                            <br />
                            <div className="table-responsive" ref={tabelaRef}>
                                <div>
                                    <Table data={hasResults ? paginatedDataLiberacao : []} columns={colunas} 
                                    className={"table table-striped table-bordered table-data dataTable no-footer"} role="grid" id="estoque" />
                                </div>
                            </div>
                            <div className="d-flex justify-content-between" id="pagination" >
                                <div className="p-2 ">
                                    <div className="d-flex justify-content-start">
                                        <Button onClick={gerarExcel} className="bg-blue-500 text-white px-4 py-2 rounded">
                                            GERAR EXCEL
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-4 ">
                                    <p>
                                        <span>
                                            Mostrando página {currentPage} de {totalPagesLiberacao} | Total de registros: {filteredLiberacoes.length}
                                        </span>
                                    </p>
                                </div>

                                <div className="d-flex justify-content-end" >
                                    <div className="d-flex justify-content-between">
                                        <div className="p-2 ">
                                            <Button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} variant={currentPage === 1 ? 'disabled' : 'primary'} className={"px-3 py-1 bg-gray-300 rounded"} >
                                                <i className=' ti ti-angle-left px-3 py-1 bg-gray-300 rounded' id='card-path' />ANTERIOR
                                            </Button>
                                        </div>
                                        <div className="p-4 ">
                                            <p>
                                                <span>
                                                    {currentPage}
                                                </span>
                                            </p>
                                        </div>

                                        <div className="p-2 ">
                                            <Button onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages} className={"px-3 py-1 bg-gray-300 rounded"} >
                                                PRÓXIMA <i className=' ti ti-angle-right px-3 py-1 bg-gray-300 rounded' />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                    {select === 'saidas' && (
                        <RelatorioSaidas />
                    )}
                </Box>
            </div>
        </ContainerSecundario>
    )
}

export default RelatoriosMovimentacao
