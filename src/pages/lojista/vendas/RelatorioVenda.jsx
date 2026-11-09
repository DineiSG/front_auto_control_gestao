import { useState, useEffect, useRef } from "react";
import ContainerSecundario from '../../../components/container/ContainerSecundario'
import { useGetData } from '../../../services/useGetData';
import { formatDateInfo } from "../../../hooks/formatDate";
import { useAuth } from "../../../hooks/useAuth"
import "../../estoque/GestaoEstoque.css";
import Box from '../../../components/box/Box'
import Table from "../../../components/table/Table";
import Input from "../../../components/input/Input";
import Select from "../../../components/select/Select";
import Button from "../../../components/button/Button";
import useExportExcel from "../../../hooks/useExportExcel"
import { useFilterPeriodo } from "../../../hooks/useFilterPeriodo";


const RelatorioVenda = () => {

  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const tabelaRef = useRef(null);

  const { user } = useAuth()
  const usuarioAtivo = user?.nome.split('.').toString()
  console.log('Usuário ativo: ', usuarioAtivo)


  // Hook personalizado para exportar para Excel
  const { generateExcel, isExporting } = useExportExcel();

  //Recebendo os veículos da tabela
  const { data: veiculos } = useGetData(`/vendas/loja/${usuarioAtivo}`);

  // Hook personalizado para filtrar as vendas por periodo
  const { startDate, endDate, setStartDate, setEndDate, filteredData, message, status, hasResults } = useFilterPeriodo({
    data: veiculos,
    dateKey: 'dataRegistro', // <-- ajuste para o nome da sua propriedade de data
  });

  //Recebe o array de objetos veiculos e realiza as tratativas de busca 
  useEffect(() => {
    if (veiculos && !veiculos.erro && Array.isArray(veiculos)) {
      console.log('Dados recebidos da API: ', veiculos);
      // Filtrar por termo e por data
      let filtrados = [...filteredData];

      if (searchTerm.trim() !== '') {
        const lower = searchTerm.toLowerCase();
        filtrados = filtrados.filter(v =>
          v.placa?.toLowerCase().includes(lower) ||
          v.unidade?.toLowerCase().includes(lower) ||
          v.comprador?.toLowerCase().includes(lower) ||
          v.vendedor?.toLowerCase().includes(lower) ||
          v.marca?.toLowerCase().includes(lower) ||
          v.modelo?.toLowerCase().includes(lower) ||
          v.instituicao?.toLowerCase().includes(lower) ||
          v.cor?.toLowerCase().includes(lower)
        );
      }

      filtrados.sort((a, b) => {
        return new Date(b.dataRegistro) - new Date(a.dataRegistro);
      });

      // dados completos
      setFilteredVehicles(filtrados);     // dados filtrados
      setCurrentPage(1);                       // reseta para primeira página ao filtrar
    }
  }, [veiculos, searchTerm, filteredData]);

  //Passando as colunas com as suas respectivas chaves
  const colunas = [
    { key: 'dataRegistro', label: 'DATA DA VENDA', format: (value) => formatDateInfo(value) /*Formatando a data para 00/00/00 */ },
    { key: 'unidade', label: 'LOJA' },
    { key: 'placa', label: 'PLACA' },
    { key: 'marca', label: 'MARCA' },
    { key: 'modelo', label: 'MODELO' },
    { key: 'cor', label: 'COR' },
    { key: 'tipoVenda', label: 'TIPO DE VENDA' },
    { key: 'valorVenda', label: 'VALOR DA VENDA (R$)' },
    { key: 'valorFinanciamento', label: 'VALOR FINANCIADO (R$)' },
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


  //############# Preparação para exportação do Excel ###############

  //Formatando as datas 
  const dataInicial = formatDateInfo(startDate)
  const dataFinal = formatDateInfo(endDate)

  //Função que gera o Excel da tabela
  const exportarExcel = async () => {
    try {
      await generateExcel({
        titulo: `Relatório de Vendas - ${usuarioAtivo}`,
        subtitulo: `Relatório correspondente ao período de ${dataInicial} a ${dataFinal}`,
        nomeArquivo: `Relatório de Vendas - ${usuarioAtivo}.xlsx`,
        nomePlanilha: `Relatório de Vendas - ${usuarioAtivo}`,
        logoUrl: "/LogoAutoControl.png",

        dados: filteredVehicles,

        colunas: [
          { chave: `dataRegistro`, titulo: `DATA DA VENDA`, largura: 25, tipo: 'data' },
          { chave: 'unidade', titulo: 'LOJA', largura: 25 },
          { chave: 'placa', titulo: 'PLACA', largura: 25 },
          { chave: 'marca', titulo: 'MARCA', largura: 25 },
          { chave: 'modelo', titulo: 'MODELO', largura: 25 },
          { chave: 'cor', titulo: 'COR', largura: 25 },
          { chave: 'tipoVenda', titulo: 'TIPO DE VENDA', largura: 25 },
          { chave: 'valorVenda', titulo: 'VALOR DA VENDA (R$)', largura: 25 },
          { chave: 'valorFinanciamento', titulo: 'VALOR FINANCIADO (R$)', largura: 25 },
          { chave: 'instituicao', titulo: 'INSTITUIÇÃO FINANCEIRA', largura: 25 },
          { chave: 'vendedor', titulo: 'VENDEDOR', largura: 25 },
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
            <p className='atual'>Vendas</p>
          </div>
        </div>
      </div>
      <div className="container d-flex justify-content-center card-container">
        <Box>
          <div className=' panel-heading '>
            <i className='ti ti-receipt' id="ti-black" ></i>
            <p>RELATÓRIO DE VENDAS DE VEICULOS DA LOJA</p>
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
                  </div>) : null}
              </div>
            </div>
          </div>
          <div className="d-flex flex-column align-items-end">
            {hasResults ? (
              <div className="p-2 ">
                <Input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} id='criterios-pesquisa' tooltipPlacement="top"
                  tooltipText={"Busque pela loja, placa, marca, modelo, cor, vendedor, instituição financeira."} placeholder="Filtro" />
              </div>
            ) : null}
          </div>
          <br />

          <div className="table-responsive" ref={tabelaRef}>
            <div>
              <Table data={paginatedData} columns={colunas} className={"table table-striped table-bordered table-data dataTable no-footer"} role="grid" id="estoque" />
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
          ) : null}
        </Box>
      </div>
    </ContainerSecundario>
  )
}

export default RelatorioVenda
