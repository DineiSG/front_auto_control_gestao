import { useState, useEffect, useRef } from "react";
import ContainerSecundario from '../../../components/container/ContainerSecundario'
import * as XLSX from "xlsx";
import { useGetData } from '../../../services/useGetData';
import { formatDateInfo } from "../../../hooks/formatDate";
import { calculateDaysInStock } from "../../../hooks/useCalc";
import { useAuth } from "../../../hooks/useAuth"
import "../../estoque/GestaoEstoque.css";
import Box from '../../../components/box/Box'
import Table from "../../../components/table/Table";
import Input from "../../../components/input/Input";
import Select from "../../../components/select/Select";
import Button from "../../../components/button/Button";
import { useFilterPeriodo } from "../../../hooks/useFilterPeriodo";
import useExportExcel from "../../../hooks/useExportExcel"

const EstoqueLojista = () => {
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const tabelaRef = useRef(null);
    const { user } = useAuth()
    const usuarioAtivo = user?.nome.split('.').toString()
    console.log('Usuário ativo: ', usuarioAtivo)


    //Recebendo os veículos da tabela
    const { data: veiculos } = useGetData(`/veiculos/unidade/${usuarioAtivo}`);

    // Hook personalizado para exportar para Excel
    const { generateExcel, isExporting } = useExportExcel();

    // Hook personalizado para filtrar as vendas por periodo
    const { startDate, endDate, setStartDate, setEndDate, filteredData, message, status, hasResults } = useFilterPeriodo({
        data: veiculos,
        dateKey: 'data_registro', // <-- ajuste para o nome da sua propriedade de data
    });

    //Recebe o array de objetos veiculos e realiza as tratativas de busca 
    useEffect(() => {

        //Calcula dias em estoque
        const dadosComDias = filteredData.map((veiculo) => ({
            ...veiculo,
            dias_estoque: calculateDaysInStock(veiculo.data_registro),
        }));


        // Filtrar por termo e por data
        let filtrados = [...dadosComDias];

        if (searchTerm.trim() !== '') {
            const lower = searchTerm.toLowerCase();
            filtrados = filtrados.filter(v =>
                v.placa?.toLowerCase().includes(lower) ||
                v.marca?.toLowerCase().includes(lower) ||
                v.modelo?.toLowerCase().includes(lower) ||
                v.cor?.toLowerCase().includes(lower) ||
                v.cambio?.toLowerCase().includes(lower) ||
                v.combustivel?.toLowerCase().includes(lower)
            );
        }

        filtrados.sort((a, b) => {
            return new Date(b.data_registro) - new Date(a.data_registro);
        });

        // dados completos
        setFilteredVehicles(filtrados);     // dados filtrados
        setCurrentPage(1);                       // reseta para primeira página ao filtrar

    }, [veiculos, searchTerm, filteredData]);


    //Passando as colunas com as suas respectivas chaves
    const colunas = [
        { key: 'unidade', label: 'UNIDADE' },
        { key: 'placa', label: 'PLACA' },
        { key: 'marca', label: 'MARCA' },
        { key: 'modelo', label: 'MODELO' },
        { key: 'cor', label: 'COR' },
        { key: 'ano_fabricacao', label: 'ANO FABRICAÇÃO' },
        { key: 'ano_modelo', label: 'ANO MODELO' },
        { key: 'combustivel', label: 'COMBUSTÍVEL' },
        { key: 'cambio', label: 'CÂMBIO' },
        { key: 'quilometragem', label: 'QUILOMETRAGEM' },
        { key: 'data_registro', label: 'DATA CADASTRO', format: (value) => formatDateInfo(value) /*Formatando a data para 00/00/00 */ },
        { key: 'dias_estoque', label: 'DIAS EM ESTOQUE', format: (value) => value !== undefined ? `${value} dia(s)` : 'N/A' /*in */ },
    ]

    //Função que trata da paginação da tabela
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredVehicles.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.ceil(filteredVehicles.length / pageSize);

    //Array de opções para o select
    const options = [
        { value: 10, label: '10' },
        { value: 20, label: '20' },
        { value: 30, label: '30' },
        { value: 50, label: '50' },
        { value: 100, label: 'TODOS' },
    ];

    // ####################### Preparando para exportar para EXCEL ################################
    // Busca o período selecionado
    const dataInicial = formatDateInfo(startDate)
    const dataFinal = formatDateInfo(endDate)

    const exportarExcel = async () => {
        try {
            await generateExcel({
                titulo: `Relatório de Estoque - ${usuarioAtivo}`,
                subtitulo: `Relatório correspondente ao período de ${dataInicial} a ${dataFinal}`,
                nomeArquivo: `Relatório de Estoque - ${usuarioAtivo}.xlsx `,
                nomePlanilha: `Estoque Veiculos - ${usuarioAtivo}`,
                logoUrl: "/LogoAutoControl.png",

                dados: filteredVehicles,

                colunas: [
                    { chave: 'unidade', titulo: 'LOJA', largura: 25 },
                    { chave: 'placa', titulo: 'PLACA', largura: 25 },
                    { chave: 'marca', titulo: 'MARCA', largura: 25 },
                    { chave: 'modelo', titulo: 'MODELO', largura: 25 },
                    { chave: 'cor', titulo: 'COR', largura: 25 },
                    { chave: 'ano_fabricacao', titulo: 'ANO DE FABRICAÇÃO', largura: 25 },
                    { chave: 'ano_modelo', titulo: 'ANO MODELO', largura: 25 },
                    { chave: 'combustivel', titulo: 'COMBUSTÍVEL', largura: 25 },
                    { chave: 'cambio', titulo: 'CÂMBIO', largura: 25 },
                    { chave: 'quilometragem', titulo: 'QUILOMETRAGEM', largura: 25 },
                    { chave: `data_registro`, titulo: `DATA CADASTRO`, largura: 25, tipo: 'data' },
                    { chave: 'dias_estoque', titulo: 'DIAS EM ESTOQUE', largura: 25, format: (value) => value !== undefined ? `${value} dia(s)` : 'N/A' /*in */ },
                ]
            })
        } catch (error) {
            console.error("Falha na exportação:", error);
        }
    }


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
                        <a className="link_a" href="/lojista">Lojista</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <p className='atual'>Estoque </p>
                    </div>
                </div>
            </div>
            <div className="container d-flex justify-content-center card-container">
                <Box>
                    <div className='panel-heading'>
                        <div className="p-1 ">
                            <i className='ti ti-car' id="ti-black" ></i>
                        </div>
                        <div className="p-2 col-12">
                            <p>VERIFICAR ESTOQUE DE VEÍCULOS</p>
                        </div>
                    </div>
                    <div className="d-flex flex-column align-items-end" >
                        <div className=" d-flex justify-content-between" >
                            <div className="p-2 ">
                            </div>
                            <div className="d-flex align-items-center gap-5">
                                {status !== "ok" && (<p className={status === "error" ? "text-danger" : "text-muted"} >{message} </p>)}
                                <div className="d-flex flex-column ">
                                    <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} tooltipText="Data inicial"
                                        tooltipPlacement="top" />
                                </div>
                                <div className="d-flex flex-column">
                                    <Input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)}
                                        tooltipText="Data final"
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
                        </div>
                    </div>
                    <div className="d-flex flex-row-reverse">
                        {hasResults ? (
                            <div className="p-2 ">
                                <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} id='criterios-pesquisa'
                                    tooltipPlacement="top" tooltipText={"Filtrar pela placa, loja, marca, modelo ou cor."} placeholder={"Filtro"} />
                            </div>
                        ) : null}
                    </div>
                    <br />
                    <div className="table-responsive " ref={tabelaRef}>
                        <div className="overflow-x-scroll">
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
                            <div className="p-4 registros_tela">
                                <p>
                                    <span>
                                        Mostrando página {currentPage} de {totalPages} | Total de registros: {filteredVehicles.length}
                                    </span>
                                </p>
                            </div>
                            <div className="d-flex justify-content-end" id="paginacao">
                                <div className="d-flex justify-content-between">
                                    <div className="p-2 ">
                                        <Button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} variant={currentPage === 1 ? 'disabled' : 'primary'} className={"px-3 py-1 bg-gray-300 rounded"} >
                                            <i className=' ti ti-angle-left px-3 py-1 bg-gray-300 rounded' id='card-path' /><span className="txt_btn">ANTERIOR</span>
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
                                            <span className="txt_btn">PRÓXIMA</span> <i className=' ti ti-angle-right px-3 py-1 bg-gray-300 rounded' />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </Box>
            </div>
        </ContainerSecundario>
    )
}

export default EstoqueLojista
