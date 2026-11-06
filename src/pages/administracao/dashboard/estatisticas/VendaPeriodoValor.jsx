import { useRef, useState, useEffect, useMemo } from "react";
import html2pdf from "html2pdf.js";
import { Bar } from "react-chartjs-2";
import Button from "../../../../components/button/Button";
import Input from "../../../../components/input/Input"
import { useGetArray } from "../../../../services/useGetArray"
import useGroupedChart from "../../../../hooks/useGroupedChart"; // seu hook atual
import { useFilterPeriodo } from "../../../../hooks/useFilterPeriodo"; // o hook criado acima
import { formatDateInfo } from "../../../../hooks/formatDate";
import ModalContent from "../../../../components/modal/ModalContent";
//import * as XLSX from 'xlsx';
import useExportExcel from "../../../../hooks/useExportExcel";
import { prepararRelatorio } from "../../../../hooks/preparaRelatorioVendas";

const VendaPeriodoValor = () => {
    const [dadosTabela, setDadosTabela] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);

    // Busca todas as vendas
    const { data: vendas = [] } = useGetArray("/vendas");

    // Importando o hook que gera a planilha excel
    const { generateExcel, isExporting, error } = useExportExcel();

    // Hook de período (defina aqui a chave da data na sua venda: "dataVenda", "createdAt", etc.)
    const { startDate, endDate, setStartDate, setEndDate, filteredData, status, message, hasResults, } = useFilterPeriodo({
        data: vendas,
        dateKey: 'dataRegistro', // <-- ajuste para o nome da sua propriedade de data
    });
    console.log("Vendas filtradas:", filteredData);



    // Ref do container do gráfico para gerar PDF
    const graphRef = useRef(null);

    // Geração dos dados do gráfico a partir APENAS das vendas filtradas
    const { chartData, chartOptions } = useGroupedChart({
        data: filteredData, // <- somente o período selecionado
        datasetLabel: "Vendas por Periodo",
        groupByKey: "unidade",
        valueKey: "valorVenda",
        aggregate: "sum",
        chartType: "bar",
        sortBy: "value",
        sortOrder: "desc"
    });

    // Função auxiliar para converter strings numéricas de forma segura
    const converterStringParaNumero = (valor) => {
        if (valor == null || valor === "") return 0;

        // Se já for número, retorna ele mesmo
        if (typeof valor === 'number') return isNaN(valor) ? 0 : valor;

        const str = String(valor).trim();

        // Se contém ponto e vírgula (ex: "20.000,00"), remove os pontos e troca a vírgula por ponto
        if (str.includes('.') && str.includes(',')) {
            const limpo = str.replace(/\./g, '').replace(',', '.');
            const num = parseFloat(limpo);
            return isNaN(num) ? 0 : num;
        }

        // Se contém apenas vírgula (ex: "20000,00" ou "20,00"), troca por ponto
        if (str.includes(',') && !str.includes('.')) {
            const limpo = str.replace(',', '.');
            const num = parseFloat(limpo);
            return isNaN(num) ? 0 : num;
        }

        // Caso seja formato padrão (ex: "20000.00" ou "20")
        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
    };

    // Função para processar os dados e estruturar para a tabela
    const processarDadosTabela = (filteredData) => {
        if (!Array.isArray(filteredData)) {
            return [];
        }

        // Mapa para armazenar os totais por modelo e loja
        const modeloLojaMap = {};

        // Agrupar e somar valores por modelo e loja
        filteredData.forEach((venda) => {
            const { modelo, unidade, valorVenda } = venda; // assumindo que o campo agora é 'modelo' e 'valorVenda'
            // Conversão corrigida usando a função auxiliar
            const valor = converterStringParaNumero(valorVenda);

            if (!modeloLojaMap[modelo]) {
                modeloLojaMap[modelo] = { Total: 0 };
            }

            if (!modeloLojaMap[modelo][unidade]) {
                modeloLojaMap[modelo][unidade] = 0;
            }

            modeloLojaMap[modelo][unidade] += valor;
            modeloLojaMap[modelo].Total += valor;
        });

        // Converter o mapa em um array estruturado
        return Object.keys(modeloLojaMap).map((modelo) => {
            const lojas = Object.keys(modeloLojaMap[modelo]).filter(key => key !== 'Total');
            const lojaComPorcentagem = lojas.reduce((acc, loja) => {
                const valor = modeloLojaMap[modelo][loja];
                const total = modeloLojaMap[modelo].Total;

                const porcentagem = (total > 0 && !isNaN(valor))
                    ? ((valor / total) * 100).toFixed(2)
                    : "0.00";

                acc[loja] = { valor, porcentagem };
                return acc;
            }, {});

            return {
                modelo, // substitui 'loja' do original
                ...lojaComPorcentagem,
                Total: modeloLojaMap[modelo].Total,
            };
        });
    };

    // Funções auxiliares fora do JSX
    const renderValor = (objetoColuna) => {
        const val = Number(objetoColuna?.valor);
        if (objetoColuna?.valor === undefined || objetoColuna?.valor === null || isNaN(val)) {
            return '0,00';
        }
        return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const renderPorcentagem = (objetoColuna) => {
        const pct = objetoColuna?.porcentagem;
        const numPct = Number(pct);

        if (pct === undefined || pct === null || isNaN(numPct) || String(pct).includes('NaN')) {
            return '0.0%';
        }
        return `${pct}%`;
    };

    // Função para calcular totais gerais por loja e porcentagens em relação ao total geral
    const calcularTotaisGerais = (dados) => {
        if (!dados || dados.length === 0) {
            return { totaisComPorcentagem: {}, totalGeral: 0 };
        }

        const totaisPorLoja = {};
        let totalGeral = 0;

        dados.forEach((linha) => {
            Object.keys(linha).forEach((coluna) => {
                if (coluna !== 'loja' && coluna !== 'Total') {
                    const valor = linha[coluna]?.valor || 0;
                    totaisPorLoja[coluna] = (totaisPorLoja[coluna] || 0) + valor;
                }
            });
            totalGeral += linha.Total || 0;
        });

        // Calcular porcentagens
        const totaisComPorcentagem = Object.keys(totaisPorLoja).reduce((acc, coluna) => {
            const valor = totaisPorLoja[coluna];
            const porcentagem = ((valor / totalGeral) * 100).toFixed(2);
            acc[coluna] = { valor, porcentagem };
            return acc;
        }, {});

        return { totaisComPorcentagem, totalGeral };
    };

    //##########################################################
    
    // Preparando os dados para a planilha em excel
    const todasLojas = useMemo(() => {
        return [...new Set(dadosTabela.flatMap(linha =>
            Object.keys(linha).filter(col => col !== 'modelo' && col !== 'Total')
        ))];
    }, [dadosTabela]);

    console.log(dadosTabela[0])

    const dadosPreparados = dadosTabela.map((item) => {
        const linha = {
            modelo: item.modelo,
            total: item.Total,
        };

        todasLojas.forEach((loja, indice) => {
            linha[`loja_${indice}_valor`] = item[loja]?.valor ?? 0;
            linha[`loja_${indice}_percentual`] =
                Number(item[loja]?.porcentagem ?? 0) / 100;
        });

        return linha;

    });

    // 2. Cria a linha TOTAL GERAL
    const linhaTotalGeral = {
        modelo: "TOTAL GERAL",
        total: 0,
    };

    todasLojas.forEach((loja, indice) => {
        const chaveValor = `loja_${indice}_valor`;
        const chavePercentual = `loja_${indice}_percentual`;

        const totalLoja = dadosPreparados.reduce(
            (soma, item) => soma + Number(item[chaveValor] ?? 0),
            0
        );

        linhaTotalGeral[chaveValor] = totalLoja;
        linhaTotalGeral[chavePercentual] = 0;
        linhaTotalGeral.total += totalLoja;
    });

    // 3. Calcula os percentuais da linha TOTAL GERAL
    todasLojas.forEach((loja, indice) => {
        const chaveValor = `loja_${indice}_valor`;
        const chavePercentual = `loja_${indice}_percentual`;

        linhaTotalGeral[chavePercentual] =
            linhaTotalGeral.total > 0
                ? linhaTotalGeral[chaveValor] / linhaTotalGeral.total
                : 0;
    });

    // 4. Junta os registros e o TOTAL GERAL
    const dadosComTotalGeral = [
        ...dadosPreparados,
        linhaTotalGeral,
    ];

    // Busca o período selecionado
    const dataInicial = formatDateInfo(startDate)
    const dataFinal = formatDateInfo(endDate)


    const configuracaoColunas = {
        tituloModelo: "MODELO",
        tituloValorTotal: "TOTAL",
        sufixoValor: " (R$)",
        sufixoPercentual: " (%)",
    };

    const colunas = [
        {
            chave: "modelo",
            titulo: configuracaoColunas.tituloModelo,
            largura: 25,
        },

        ...todasLojas.flatMap((loja, indice) => [
            {
                chave: `loja_${indice}_valor`,
                titulo: `${loja}${configuracaoColunas.sufixoValor}`,
                tipo: "moeda",
                largura: 20,
                corFundo: "E3C0F7"
            },
            {
                chave: `loja_${indice}_percentual`,
                titulo: `${loja}${configuracaoColunas.sufixoPercentual}`,
                tipo: "percentual",
                largura: 20,
            },
        ]),

        {
            chave: "total",
            titulo: configuracaoColunas.tituloValorTotal,
            tipo: "moeda",
            largura: 20,
        },
    ];

    // No momento da exportação:
    const exportar = async () => {
        const {
            colunas: colunasExcel,
            dados: dadosExcel,

        } = prepararRelatorio({
            dados: dadosComTotalGeral,
            colunas,
            transformarDados: (dados) => dados,
        });

        await generateExcel({
            titulo: "Relatório de Vendas por Loja",
            subtitulo: "Por valores",
            periodo: {
                inicio: dataInicial,
                fim: dataFinal,
            },
            nomeArquivo: "relatorio_vendas.xlsx",
            nomePlanilha: "Vendas",
            logoUrl: "/aspa.png",
            marcaDaguaUrl: null,
            mostrarTotais: false,
            chaveRotuloTotal: "modelo",
            colunas: colunasExcel,
            dados: dadosExcel,
        });
    };

    //##################################################################
    // Função que gera o PDF do gráfico
    const gerarPDF = () => {
        const element = graphRef.current

        const opt = {
            margin: [0.5, 0.5, 0.8, 0.5],//[superior, esquerda, inferior, direita]
            filename: "Vendas Periodo - em valores",
            image: {
                type: 'jpeg',
                quality: 1.0
            },
            html2canvas: {
                scale: 3,
                useCORS: true,
                backgroundColor: '#ffffff'
            },
            jsPDF: {

                unit: 'in',
                format: 'a4',
                orientation: 'landscape'
            }
        };
        html2pdf().set(opt).from(element).save();
    };

    //##################################################################
    // Calcular totais gerais sempre que dadosTabela muda
    const { totaisComPorcentagem, totalGeral } = useMemo(() => {
        return calcularTotaisGerais(dadosTabela);
    }, [dadosTabela]);

    // Atualiza dadosTabela sempre que filteredData muda
    useEffect(() => {
        const tabela = processarDadosTabela(filteredData);
        setDadosTabela(tabela);
    }, [filteredData]);


    return (
        <div className="d-flex flex-column align-items-center w-100">
            {/* Cabeçalho */}
            {!hasResults && (
                <div className="panel-heading w-100  align-items-center gap-2" style={{ maxWidth: "1000px" }}>
                    <i className="ti ti-money" id="ti-black"></i>
                    <h4 style={{ paddingTop: "15px" }}>VENDAS EM UM PERÍODO (Valor total por loja)</h4>
                </div>
            )}

            {/* Filtros de período */}
            <div className="d-flex align-items-center gap-2 my-3" id="date_select">
                {/* Input de Data Início */}
                <div className="d-flex flex-column">
                    <Input label={"Data Inicial"} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                {/* Input de Data Fim */}
                <div className="d-flex flex-column">
                    <Input label={"Data Final"} type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
                </div>
            </div>

            {/* Mensagens de estado */}
            {status !== "ok" && (<p className={status === "error" ? "text-danger" : "text-muted"}> {message} </p>)}

            {/* Gráfico + botão PDF: só aparecem quando há resultados */}
            {hasResults && (
                <>
                    <div ref={graphRef}>
                        <img src="./aspa.png" alt="Logomarca da empresa" className="relatorio-logo" />
                        <br />
                        <br />
                        <div className="conteudo-relatorio">
                            <div className="panel-heading w-100  align-items-center gap-2" style={{ maxWidth: "1000px" }}>
                                <i className="ti ti-money" id="ti-black"></i>
                                <h4 style={{ paddingTop: "15px" }}>VENDAS EM UM PERÍODO (Valor total por loja)</h4>
                            </div>
                            <br />
                            <p>Periodo: de <strong>{formatDateInfo(startDate)} </strong>a <strong>{formatDateInfo(endDate)}</strong></p>
                            <br />
                            <div style={{ width: "1000px", height: "400px" }}>
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-end w-100 px-3" style={{ maxWidth: "1000px" }}>
                        <Button onClick={gerarPDF} className="bg-blue-500 text-white px-4 py-2 rounded mt-3">
                            GERAR PDF
                        </Button>
                    </div>
                    <br />
                    <br />
                    <Button onClick={() => setModalAberto(true)} className="bg-blue-500 text-white px-4 py-2 rounded mt-3">
                        VISUALIZAR TABELA
                    </Button>
                    {/* Tabela com barra de rolagem horizontal */}
                    <ModalContent isOpen={modalAberto} onClose={() => setModalAberto(false)} title="" size="fullscreen" >
                        <img src="./aspa.png" alt="Logomarca da empresa" className="relatorio-logo" />
                        <br />
                        <br />
                        <div className="conteudo-relatorio">
                        </div>
                        <h2>Tabela de Valores - Vendas Por Modelo</h2>
                        <div className="d-flex flex-column align-items-end" id="date_select">
                            <div className=" d-flex justify-content-between gap-3" >
                                {/* Input de Data Início */}
                                <div className="d-flex flex-column">
                                    <Input label={"Data Inicial"} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                                </div>

                                {/* Input de Data Fim */}
                                <div className="d-flex flex-column">
                                    <Input label={"Data Final"} type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
                                </div>
                            </div>
                        </div>
                        <div className="w-100 d-flex justify-content-center mt-4" style={{ overflowX: "auto" }}>
                            <div className="table-responsive" >
                                {dadosTabela.length > 0 ? (
                                    <table className="table table-striped table-light " border="1" cellPadding="5" cellSpacing="0" style={{
                                        minWidth: "max-content"
                                    }}>
                                        <thead>
                                            <tr>
                                                <th></th>
                                                {todasLojas.map((coluna) => (
                                                    <>
                                                        <th key={`${coluna}-valor`} style={{ color: 'blue' }}>{coluna}</th>
                                                        <th key={`${coluna}-porcentagem`} style={{ color: 'red' }}>%{coluna}</th>
                                                    </>
                                                ))}
                                                <th>TOTAL</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dadosTabela.map((linha, index) => (
                                                <tr key={index}>
                                                    <td>{linha.modelo}</td>
                                                    {todasLojas.map((coluna) => (
                                                        <>
                                                            <td key={`${coluna}-valor-${index}`} style={{ color: 'blue', textAlign: 'center' }}>
                                                                R$ {renderValor(linha[coluna])}
                                                            </td>
                                                            <td key={`${coluna}-porcentagem-${index}`} style={{ color: 'red', textAlign: 'center' }}>
                                                                {renderPorcentagem(linha[coluna])}
                                                            </td>
                                                        </>
                                                    ))}
                                                    <td>R$ {linha.Total !== undefined ? linha.Total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td style={{ fontWeight: '700' }}>TOTAL GERAL</td>
                                                {todasLojas.map((coluna) => (
                                                    <>
                                                        <td key={`${coluna}-total`} style={{ color: 'blue', textAlign: 'center' }}>
                                                            R$ {totaisComPorcentagem[coluna]?.valor?.toFixed(2) || '0,00'}
                                                        </td>
                                                        <td key={`${coluna}-porcentagem-total`} style={{ color: 'red', textAlign: 'center' }}>
                                                            {totaisComPorcentagem[coluna]?.porcentagem || '0.0'} %
                                                        </td>
                                                    </>
                                                ))}
                                                <td>R$ {totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                ) : null}
                            </div>
                        </div>
                        <br />
                        <br />
                        <div className="d-flex justify-content-start w-100 " style={{ maxWidth: "1000px" }}>
                            <Button onClick={exportar} disabled={isExporting} className="bg-green-500 text-white px-4 py-2 rounded mt-3">
                                {isExporting ? "EXPORTANDO" : "GERAR EXCEL"}
                            </Button>
                            {error && <p role="alert">{error}</p>}
                        </div>
                        <br />
                        <br />
                    </ModalContent>
                    <br />
                    <br />

                </>
            )}
        </div>
    );
}

export default VendaPeriodoValor