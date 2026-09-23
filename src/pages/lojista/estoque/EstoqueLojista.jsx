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

const EstoqueLojista = () => {
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const tabelaRef = useRef(null);

    const { user } = useAuth()
    const usuarioAtivo = user?.nome.split('.').toString()
    console.log('Usuário ativo: ', usuarioAtivo)


    //Recebendo os veículos da tabela
    const { data: veiculos } = useGetData(`/veiculos/unidade/${usuarioAtivo}`);

    //Recebe o array de objetos veiculos e realiza as tratativas de busca 
    useEffect(() => {
        if (veiculos && !veiculos.erro && Array.isArray(veiculos)) {
            console.log('Dados recebidos da API: ', veiculos);

            //Calcula dias em estoque
            const dadosComDias = veiculos.map((veiculo) => ({
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

            if (filterDate !== '') {
                filtrados = filtrados.filter(v => {
                    const dataRegistro = new Date(v.data_registro).toISOString().split('T')[0]; // YYYY-MM-DD
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
        { key: 'data_registro', label: 'DATA CADASTRO', format: (value) => formatDateInfo(value) /*Formatando a data para 00/00/00 */ },
        { key: 'placa', label: 'PLACA' },
        { key: 'marca', label: 'MARCA' },
        { key: 'modelo', label: 'MODELO' },
        { key: 'cor', label: 'COR' },
        { key: 'ano_fabricacao', label: 'ANO FABRICAÇÃO' },
        { key: 'ano_modelo', label: 'ANO MODELO' },
        { key: 'dias_estoque', label: 'DIAS EM ESTOQUE', format: (value) => value !== undefined ? `${value} dia(s)` : 'N/A' /*in */ },
        { key: 'combustivel', label: 'COMBUSTÍVEL' },
        { key: 'cambio', label: 'CÂMBIO' },
        { key: 'quilometragem', label: 'QUILOMETRAGEM' }

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
            Loja: filtrados.unidade,
            Data_Cadastro: formatDateInfo(filtrados.data_registro),
            Marca: filtrados.marca,
            Modelo: filtrados.modelo,
            Cor: filtrados.cor,
            Ano_Fabricacao: filtrados.ano_fabricacao,
            Ano_Modelo: filtrados.ano_modelo,
            Placa: filtrados.placa,
            Renavan: filtrados.renavan,
            Dias_Estoque: filtrados.dias_estoque,
            Combustível: filtrados.combustivel,
            Câmbio: filtrados.cambio,
            Quilometragem: filtrados.quilometragem

        }))

        const worksheet = XLSX.utils.json_to_sheet(formattedData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Data")
        XLSX.writeFile(workbook, `Relatorio de Estoque - ${usuarioAtivo}.xlsx`) 
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
                    <div className='d-flex justify-content-between panel-heading'>
                        <div className=' panel-heading '>
                            <div className="p-1 ">
                                <i className='ti ti-car' id="ti-black" ></i>
                            </div>
                            <div className="p-2">
                                <p>VERIFICAR ESTOQUE DE VEÍCULOS</p>
                            </div>
                        </div>
                        <div className="d-flex flex-row-reverse" >
                            <div className="d-flex justify-content-start">
                                <div className="p-2 ">
                                    <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} id='criterios-pesquisa' tooltipPlacement="top" tooltipText={"Busque pela placa, marca, modelo ou cor."} />
                                </div>
                                <div className="p-2 ">
                                    <Input type="date" value={filterDate} onChange={e => setFilterDate(e.target.value)} tooltipPlacement="top" tooltipText={"Busque pela data de registro do veículo."} />
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
    )
}

export default EstoqueLojista
