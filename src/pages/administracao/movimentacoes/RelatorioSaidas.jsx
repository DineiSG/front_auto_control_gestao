import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import "../Administracao.css";

import { useState, useEffect, useRef } from "react";
import { useGetArray } from "../../../services/useGetArray";
import { formatDateInfo } from "../../../hooks/formatDate";
import { useFilterPeriodo } from "../../../hooks/useFilterPeriodo";

import Table from "../../../components/table/Table";
import Input from "../../../components/input/Input";
import Select from "../../../components/select/Select";
import Button from "../../../components/button/Button";
import useExportExcel from "../../../hooks/useExportExcel"

const RelatorioSaidas = () => {
    const [filteredSaidas, setFilteredSaidas] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const tabelaRef = useRef(null);

    // Hook personalizado para exportar para Excel
    const { generateExcel, isExporting } = useExportExcel();

    //Recebendo os veículos da tabela
    const { data: saidas = [] } = useGetArray(`/wow/registro-saida`);

    // Hook personalizado para filtrar os dados por periodo
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

    //############# Preparação para exportação do Excel ###############

    //Formatando as datas 
    const dataInicial = formatDateInfo(startDate)
    const dataFinal = formatDateInfo(endDate)

    //Função que gera o Excel da tabela
    const exportarExcel = async () => {
        try {
            await generateExcel({
                titulo: `Relatório de Saídas`,
                subtitulo: `Relatório correspondente ao período de ${dataInicial} a ${dataFinal}`,
                nomeArquivo: `Relatório de Saídas.xlsx`,
                nomePlanilha: `Relatório de Saídas`,
                logoUrl: "/aspa.png",

                dados: filteredSaidas,

                colunas: [
                    { chave: `data_registro`, titulo: `DATA DA SOLICITAÇÃO`, largura: 25, tipo: 'data' },
                    { chave: 'unidade', titulo: 'LOJA', largura: 25 },
                    { chave: 'placa', titulo: 'PLACA', largura: 25 },
                    { chave: 'responsavelMovimentacaoNome', titulo: 'SOLICITANTE', largura: 25 },
                    { chave: 'tipoMovimentacao', titulo: 'MOTIVO', largura: 25 },
                    { chave: 'observacaoMovimentacao', titulo: 'OBSERVAÇÃO', largura: 25 },
                ]
            })
        } catch (error) {
            console.error("Falha na exportação:", error);
        }
    }

    return (
        <>

            <div className="d-flex flex-column align-items-end" >
                <div className="d-flex align-items-center gap-5">
                    {status !== "ok" && (<p className={status === "error" ? "text-danger" : "text-muted"} >{message} </p>)}
                    <div className="d-flex flex-column ">
                        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} tooltipText="Data inicial"
                            tooltipPlacement="top" />
                    </div>
                    <div className="d-flex flex-column">
                        <Input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} tooltipText="Data final"
                            tooltipPlacement="top" />
                    </div>
                    {hasResults ? (
                        <div className="p-2">
                            <div className="p-1 ">
                                <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} options={options} className={"quantidade"} />
                            </div>
                        </div>
                    ) : null}
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
            {hasResults ? (
                <div className="d-flex justify-content-between" id="pagination" >
                    <div className="p-2 ">
                        <div className="d-flex justify-content-start">
                            <Button onClick={exportarExcel} disabled={isExporting} className="bg-green-500 text-white px-4 py-2 rounded mt-3">
                                {isExporting ? "EXPORTANDO" : "GERAR EXCEL"}
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
            ) : null}
        </>

    )
}

export default RelatorioSaidas
