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

const RelatorioSaidas = () => {
    const [filteredSaidas, setFilteredSaidas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const tabelaRef = useRef(null);

    //Recebendo os veículos da tabela
    const { data: saidas = [] } = useGetArray(`/wow/registro-saida`);

    const { startDate, endDate, setStartDate, setEndDate, filteredData, message, status, hasResults } = useFilterPeriodo({
        data: saidas,
        dateKey: 'data_registro', // <-- ajuste para o nome da sua propriedade de data
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
            return new Date(b.data_registro) - new Date(a.data_registro);
        });

        setFilteredSaidas(filtrados)
    }, [searchTerm, filteredData])


    //Passando as colunas com as suas respectivas chaves
    const colunas = [
        { key: 'unidade', label: 'LOJA' },
        { key: 'placa', label: 'PLACA' },
        { key: 'data_registro', label: 'DATA DA SOLICITAÇÃO', format: (value) => formatDateInfo(value) /*Formatando a data para 00/00/00 */ },
        { key: 'tipoMovimentacao', label: 'MOTIVO' },
        { key: 'responsavelMovimentacaoNome', label: 'SOLICITANTE' },
        { key: 'observacaoMovimentacao', label: 'OBSERVAÇÃO' }

    ]


    //Função que trata da paginação da tabela baixas
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredSaidas.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.ceil(filteredSaidas.length / pageSize);


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

        const formattedData = dataToExport.map(filtrados => ({
            Loja: filtrados.unidade,
            Placa: filtrados.placa,
            Data_da_Solicitação: formatDateInfo(filtrados.data_registro), // aplica sua função de formatação
            Motivo: filtrados.tipoMovimentacao,
            Solicitante: filtrados.responsavelMovimentacaoNome,
            Observação: filtrados.observacaoMovimentacao
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
        XLSX.writeFile(workbook, `Relatorio de Solicitação de Liberação.xlsx`);
    };



    return (
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
                            Mostrando página {currentPage} de {totalPages} | Total de registros: {filteredSaidas.length}
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

    )
}

export default RelatorioSaidas
