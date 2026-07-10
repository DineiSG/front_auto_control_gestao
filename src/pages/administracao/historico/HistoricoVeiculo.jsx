import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import { useState, useEffect, useRef } from "react";
import ContainerSecundario from "../../../components/container/ContainerSecundario";
import * as XLSX from "xlsx";
import { useGetArray } from "../../../services/useGetArray";
import { formatDateInfo } from "../../../hooks/formatDate";
import { calculateDaysInStock } from "../../../hooks/useCalc";
import "../Administracao.css";
import Box from '../../../components/box/Box'
import Table from "../../../components/table/Table";
import Input from "../../../components/input/Input";
import Select from "../../../components/select/Select";
import Button from "../../../components/button/Button";


const HistoricoVeiculo = () => {

    const [filteredBaixas, setFilteredBaixas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [mostrarTabela, setMostrarTabela] = useState(false);
    const tabelaRef = useRef(null);
    const ultimaPlacaBuscada = useRef('');


    //Recebendo os veículos da tabela
    const { data: baixas } = useGetArray(`/baixas`);


    const handleBlur = () => {

        const placaM = searchTerm.trim().toUpperCase();
        if (placaM.length === 7) {
            // Só busca se a placa for diferente da última buscada
            if (placaM !== ultimaPlacaBuscada.current) {
                //console.log('Buscando placa:', placaM); // Debug
                ultimaPlacaBuscada.current = placaM;
                setSearchTerm(placaM);
            }
            setMostrarTabela(true);
        } else {
            setMostrarTabela(false);
        }

    };

    //Recebe o array de objetos veiculos e realiza as tratativas de busca 
    useEffect(() => {
        if (baixas && !baixas.erro && Array.isArray(baixas)) {
            //console.log('Dados recebidos da API: ', baixas);

            // Organiza os veículos por loja (ordem alfabética)
            const lojasOrdenadas = [...baixas,].sort((a, b) =>
                (a?.unidade || '').localeCompare(b?.unidade || '')
            );

            //Calcula dias em estoque
            const dadosComDias = lojasOrdenadas.map((veiculo) => ({
                ...veiculo,
                dias_estoque: calculateDaysInStock(veiculo.dataRegistro),
            }));


            // Filtrar por termo e por data
            let filtrados = [...dadosComDias];

            if (searchTerm.trim() !== '') {
                const lower = searchTerm.toLowerCase();
                filtrados = filtrados.filter(v =>
                    v.placa?.toLowerCase().includes(lower)
                );
            }

            // dados completos
            setFilteredBaixas(filtrados);     // dados filtrados
            setCurrentPage(1);                // reseta para primeira página ao filtrar
        }



    }, [baixas, searchTerm]);

    //Passando as colunas com as suas respectivas chaves
    const colunas = [
        { key: 'unidade', label: 'LOJA' },
        { key: 'data_cadastro', label: 'DATA CADASTRO', },
        { key: 'dataRegistro', label: 'DATA  BAIXA', format: (value) => formatDateInfo(value) /*Formatando a data para 00/00/00 */ },
        { key: 'marca', label: 'MARCA' },
        { key: 'modelo', label: 'MODELO' },
        { key: 'cor', label: 'COR' },
        { key: 'placa', label: 'PLACA' },
        { key: 'solicitante', label: 'SOLICITANTE BAIXA' },
        { key: 'motivo', label: 'MOTIVO DA BAIXA' },
        //{ key: 'renavan', label: 'RENAVAM' },
        //{ key: 'dias_estoque', label: 'DIAS EM ESTOQUE', format: (value) => value !== undefined ? `${value} dia(s)` : 'N/A' /*in */ },
    ]

    //Função que trata da paginação da tabela baixas
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredBaixas.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.ceil(filteredBaixas.length / pageSize);

    //Array de opções para o select
    const options = [
        { value: 10, label: '10' },
        { value: 20, label: '20' },
        { value: 30, label: '30' },
        { value: 50, label: '50' },
        { value: 100, label: 'TODOS' },
    ];

    //Funçao que gera o excel da tabela
    const gerarExcel = () => {
        const formattedData = filteredBaixas.map(filtrados => ({
            Loja: filtrados.unidade,
            Marca: filtrados.marca,
            Modelo: filtrados.modelo,
            Cor: filtrados.cor,
            Placa: filtrados.placa,
            Data_Cadastro: formatDateInfo(filtrados.data_cadastro),
            Data_Baixa: formatDateInfo(filtrados.dataRegistro),
            Solicitante: filtrados.solicitante,
            Motivo: filtrados.motivo
        }))

        const worksheet = XLSX.utils.json_to_sheet(formattedData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
        XLSX.writeFile(workbook, "Histórico do Veículo.xlsx")
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
                        <a className="link_a" href="/administracao">Administração</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <p className='atual'>Histórico do Veículo </p>
                    </div>
                </div>
            </div>
            <div className="container d-flex justify-content-center card-container">
                <Box>

                    <div className='d-flex justify-content-between panel-heading'>
                        <div className="d-flex justify-content-start">
                            <div className="p-1 ">
                                <i className='ti ti-car' id="ti-black" />
                            </div>
                            <div className="p-2 ">
                                <p>HISTÓRICO DE VEÍCULOS</p>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between">
                            <div className="p-2 ">
                                <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} tooltipText="Buscar por um veículo pela placa" tooltipPlacement="top"
                                    placeholder={"Filtro"} id='criterios-pesquisa' onBlur={handleBlur} />
                            </div>
                            <div className="p-1 ">
                                <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} options={options} className={"quantidade"} />
                            </div>
                        </div>
                    </div>
                    <>
                        {mostrarTabela && (
                            <div className="table-responsive" ref={tabelaRef}>
                                <div>
                                    <Table data={paginatedData} columns={colunas} className={"table table-striped table-bordered table-data dataTable no-footer"} role="grid" id="estoque" />
                                </div>
                            </div>
                        )}
                        <br />
                        <br />

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
                </Box>
            </div>
        </ContainerSecundario>
    )
}

export default HistoricoVeiculo
