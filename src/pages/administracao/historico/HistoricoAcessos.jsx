import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import { useState, useEffect, useRef } from "react";
import ContainerSecundario from "../../../components/container/ContainerSecundario";
import * as XLSX from "xlsx";
import { useGetArray } from "../../../services/useGetArray";
import { formatTimestampWithTime } from "../../../hooks/formatDate";
import Box from '../../../components/box/Box'
import Table from "../../../components/table/Table";
import Input from "../../../components/input/Input";
import Select from "../../../components/select/Select";
import Button from "../../../components/button/Button";
import useExportExcel from "../../../hooks/useExportExcel"

const HistoricoAcessos = () => {

    const [filteredAcessos, setFilteredAcessos] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [mostrarTabela, setMostrarTabela] = useState(false);
    const tabelaRef = useRef(null);
    const ultimaPlacaBuscada = useRef('');


    //Recebendo os veículos da tabela
    const { data: acessos } = useGetArray(`/acessos`);

    // Hook personalizado para exportar para Excel
    const { generateExcel, isExporting } = useExportExcel();

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

    // Recebe o array de objetos veiculos e realiza as tratativas de busca 
    useEffect(() => {
        if (acessos && !acessos.erro && Array.isArray(acessos)) {
            // Primeiro, aplica a filtragem por janela de 5 minutos


            // Ordena por placa (opcional: você pode manter essa ordenação ou mudar para data)
            const lojasOrdenadas = [...acessos].sort((a, b) =>
                (a?.placa || '').localeCompare(b?.placa || '')
            );

            // 3. Aplica filtro de busca (searchTerm)
            let filtrados = [...lojasOrdenadas];
            if (searchTerm.trim() !== '') {
                const lower = searchTerm.toLowerCase();
                filtrados = filtrados.filter(v =>
                    v.placa?.toLowerCase().includes(lower)
                );
            }

            // 4. Atualiza estado
            setFilteredAcessos(filtrados);
            setCurrentPage(1);
        }
    }, [acessos, searchTerm]);



    //Passando as colunas com as suas respectivas chaves
    const colunas = [
        { key: 'placa', label: 'PLACA' },
        { key: 'tipo_veiculo', label: 'TIPO DE AQUISIÇÃO' },
        { key: 'data_registro', label: 'DATA ACESSO', format: (value) => value ? formatTimestampWithTime(value) : '-'  /*Formatando a data para 00/00/00 */ },
        { key: 'deviceName', label: 'EQUIPAMENTO' },
        { key: 'ipaddr', label: 'IP DO EQUIPAMENTO' }
    ]

    console.log('Acessos recebidos:', acessos); // Debug: veja o que está vindo da API


    //Função que trata da paginação da tabela acessos
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedData = filteredAcessos.slice(startIndex, startIndex + pageSize);
    const totalPages = Math.ceil(filteredAcessos.length / pageSize);


    //Array de opções para o select
    const options = [
        { value: 10, label: '10' },
        { value: 20, label: '20' },
        { value: 30, label: '30' },
        { value: 50, label: '50' },
        { value: 100, label: 'TODOS' },
    ];


    //############# Preparação para exportação do Excel ###############

    //Função que gera o Excel da tabela
    const exportarExcel = async () => {
        try {
            await generateExcel({
                titulo: `Relatório de Movimentações - Entradas / Saídas`,
                subtitulo: `Relatório correspondente às movimentações de entrada e saída de veículos`,
                nomeArquivo: `Relatório de Movimentações.xlsx`,
                nomePlanilha: `Relatório de Movimentações`,
                logoUrl: "/aspa.png",

                dados: filteredAcessos,

                colunas: [
                    { chave: `data_registro`, titulo: `DATA DA MOVIMENTAÇÃO`, largura: 25, tipo: 'data' },
                    { chave: 'placa', titulo: 'PLACA', largura: 25 },
                    { chave: 'deviceName', titulo: 'EQUIPAMENTO', largura: 25 },
                    { chave: 'ipaddr', titulo: 'IP DO EQUIPAMENTO', largura: 25 },
                    { chave: 'tipo_veiculo', titulo: 'TIPO DE AQUISIÇÃO', largura: 25 }
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
                        <a className="link_a" href="/administracao">Administração</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <p className='atual'>Histórico de Acessos </p>
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
                                <p>HISTÓRICO DE ACESSOS</p>
                            </div>
                        </div>
                        <div className="d-flex justify-content-between">
                            <div className="p-2 ">
                                <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}//Alterado aqui
                                    tooltipText="Informe a placa de um veículo para buscar o registro de acessos." tooltipPlacement="top"
                                    placeholder={"Placa"} id='criterios-pesquisa' onBlur={handleBlur} label="Informe a placa: " />
                            </div>
                            {mostrarTabela && (
                                <div className="p-1 ">
                                    <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} options={options} className={"quantidade"} />
                                </div>
                            )}
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
                        {mostrarTabela && (
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
                                            Mostrando página {currentPage} de {totalPages} | Total de registros: {filteredAcessos.length}
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
                        )}
                    </>
                </Box>
            </div>
        </ContainerSecundario>
    )
}

export default HistoricoAcessos
