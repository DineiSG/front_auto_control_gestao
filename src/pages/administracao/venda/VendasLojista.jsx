import { useState, useEffect, useRef } from "react";
import ContainerSecundario from '../../../components/container/ContainerSecundario'
import * as XLSX from "xlsx";
import { useGetData } from '../../../services/useGetData';
import { formatDateInfo } from "../../../hooks/formatDate";
import { calculateDaysInStock } from "../../../hooks/useCalc";
import "../../estoque/GestaoEstoque.css";
import Box from '../../../components/box/Box'
import Table from "../../../components/table/Table";
import Input from "../../../components/input/Input";
import Select from "../../../components/select/Select";
import Button from "../../../components/button/Button";

const VendasLojista = () => {

    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const tabelaRef = useRef(null);

    //Recebendo os veículos da tabela
    const { data: veiculos } = useGetData(`/vendas`);

    //Recebe o array de objetos veiculos e realiza as tratativas de busca 
    useEffect(() => {
        if (veiculos && !veiculos.erro && Array.isArray(veiculos)) {
            console.log('Dados recebidos da API: ', veiculos);

            // Organiza os veículos por loja (ordem alfabética)
            const lojasOrdenadas = [...veiculos].sort((a, b) =>
                (a?.unidade || '').localeCompare(b?.unidade || '')
            );

            //Calcula dias em estoque
            const dadosComDias = lojasOrdenadas.map((veiculo) => ({
                ...veiculo,
                dias_estoque: calculateDaysInStock(veiculo.data_registro),
            }));


            // Filtrar por termo e por data
            let filtrados = [...dadosComDias];

            if (searchTerm.trim() !== '') {
                const lower = searchTerm.toLowerCase();
                filtrados = filtrados.filter(v =>
                    v.unidade?.toLowerCase().includes(lower) ||
                    v.comprador?.toLowerCase().includes(lower) ||
                    v.vendedor?.toLowerCase().includes(lower) ||
                    v.marca?.toLowerCase().includes(lower) ||
                    v.modelo?.toLowerCase().includes(lower) ||
                    v.instituicao?.toLowerCase().includes(lower) ||
                    v.cor?.toLowerCase().includes(lower)
                );
            }

            if (filterDate !== '') {
                filtrados = filtrados.filter(v => {
                    const dataRegistro = new Date(v.dataRegistro).toISOString().split('T')[0]; // YYYY-MM-DD
                    return dataRegistro === filterDate;
                });
            }

            // dados completos
            setFilteredVehicles(filtrados);     // dados filtrados
            setCurrentPage(1);                       // reseta para primeira página ao filtrar
        }
    }, [veiculos, searchTerm, filterDate]);

    //Passando as colunas com as suas respectivas chaves
    const colunas = [
        { key: 'comprador', label: 'COMPRADOR' },
        { key: 'dataRegistro', label: 'DATA COMPRA', format: (value) => formatDateInfo(value) /*Formatando a data para 00/00/00 */ },
        { key: 'unidade', label: 'LOJA' },
        { key: 'marca', label: 'MARCA' },
        { key: 'modelo', label: 'MODELO' },
        { key: 'cor', label: 'COR' },
        { key: 'valorVenda', label: 'VALOR VENDA (R$)' },
        { key: 'tipoVenda', label: 'TIPO VENDA' },
        { key: 'instituicao', label: 'INSTITUIÇÃO FINANCEIRA' },
        { key: 'vendedor', label: 'VENDEDOR' }

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

    //Funçao que gera o excel da tabela
    const gerarExcel = () => {
        const formattedData = filteredVehicles.map(filtrados => ({
            Comprador: filtrados.comprador,
            Data_Compra: formatDateInfo(filtrados.dataRegistro),
            Loja: filtrados.unidade,
            Marca: filtrados.marca,
            Modelo: filtrados.modelo,
            Cor: filtrados.cor,
            Valor_Venda: filtrados.valorVenda,
            Tipo_Venda: filtrados.tipoVenda,
            Instituição: filtrados.instituicao,
            Vendedor: filtrados.vendedor

        }))

        const worksheet = XLSX.utils.json_to_sheet(formattedData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
        XLSX.writeFile(workbook, "RELATÓRIO DE VENDAS.xlsx")
    };

    return (
        <div>
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
                            <p className='atual'>Vendas </p>
                        </div>
                    </div>
                </div>
                <div className="container d-flex justify-content-center card-container">
                    <Box>
                        <div className='d-flex justify-content-between panel-heading'>
                            <div className=' panel-heading '>
                                <div className="p-1 ">
                                    <i className='ti ti-money' id="ti-black" ></i>
                                </div>
                                <div className="p-2">
                                    <p>RELATÓRIO DE VENDAS DE VEICULOS</p>
                                </div>
                            </div>
                            <div className="d-flex flex-row-reverse" >
                                <div className="d-flex justify-content-start">
                                    <div className="p-2 ">
                                        <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} id='criterios-pesquisa' tooltipPlacement="top"
                                            tooltipText={"Busque pela loja,marca, modelo, cor, vendedor ou instituição financeira."} />
                                    </div>
                                    <div className="p-2 ">
                                        <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} tooltipPlacement="top" tooltipText={"Busque pela data de registro da venda do veículo."} />
                                    </div>
                                    <div className="p-1 ">
                                        <Select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} options={options} className={"quantidade"} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="table-responsive" ref={tabelaRef}>
                            <div>
                                <Table data={paginatedData} columns={colunas} className={"table table-striped table-bordered table-data dataTable no-footer"} role="grid" id="estoque" />
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
                                        Mostrando página {currentPage} de {totalPages} | Total de registros: {filteredVehicles.length}
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
                    </Box>
                </div>
            </ContainerSecundario>
        </div>
    )
}

export default VendasLojista
