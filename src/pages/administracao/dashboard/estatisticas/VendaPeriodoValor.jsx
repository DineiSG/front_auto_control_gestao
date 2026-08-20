import { useRef, useState, useEffect, useMemo } from "react";
import html2pdf from "html2pdf.js";
import { Bar } from "react-chartjs-2";
import Button from "../../../../components/button/Button";
import Input from "../../../../components/input/Input"
import { useGetArray } from "../../../../services/useGetArray"
import useGroupedChart from "../../../../hooks/useGroupedChart"; // seu hook atual
import { useFilterPeriodo } from "../../../../hooks/useFilterPeriodo"; // o hook criado acima
import ModalContent from "../../../../components/modal/ModalContent";
import * as XLSX from 'xlsx';

const VendaPeriodoValor = () => {
    const [dadosTabela, setDadosTabela] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);

    // Busca todas as vendas
    const { data: vendas = [] } = useGetArray("/vendas");


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


    const generateExcel = () => {
        if (!Array.isArray(dadosTabela) || dadosTabela.length === 0) {
            console.warn("Nenhum dado para exportar.");
            return;
        }

        // Obter todas as lojas únicas (mesma lógica usada na renderização)
        const todasLojas = [...new Set(
            dadosTabela.flatMap(linha =>
                Object.keys(linha).filter(col => col !== 'modelo' && col !== 'Total')
            )
        )];

        // Formatar os dados dos modelos
        const formattedData = dadosTabela.map((linha) => {
            const formattedRow = { Modelo: linha.modelo };

            // Para cada loja, adicionar valor e porcentagem
            todasLojas.forEach(loja => {
                const dado = linha[loja] || { valor: 0, porcentagem: "0.00" };
                formattedRow[`${loja} (R$)`] = parseFloat(dado.valor).toFixed(2);
                formattedRow[`${loja} (%)`] = dado.porcentagem;
            });

            formattedRow["Total (R$)"] = parseFloat(linha.Total).toFixed(2);
            return formattedRow;
        });

        // Linha de TOTAL GERAL
        const totaisGeraisRow = { Modelo: "TOTAL GERAL" };

        todasLojas.forEach(loja => {
            const dado = totaisComPorcentagem[loja] || { valor: 0, porcentagem: "0.00" };
            totaisGeraisRow[`${loja} (R$)`] = parseFloat(dado.valor).toFixed(2);
            totaisGeraisRow[`${loja} (%)`] = dado.porcentagem;
        });

        totaisGeraisRow["Total (R$)"] = parseFloat(totalGeral).toFixed(2);
        formattedData.push(totaisGeraisRow);

        // Definir ordem das colunas: Modelo, [Loja1 (R$), Loja1 (%), ...], Total (R$)
        const columnOrder = [
            "Modelo",
            ...todasLojas.flatMap(loja => [`${loja} (R$)`, `${loja} (%)`]),
            "Total (R$)"
        ];

        // Criar planilha
        const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: columnOrder });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas por Modelo e Loja");

        // Salvar arquivo
        XLSX.writeFile(workbook, "Relatorio_Vendas_por_Modelo_e_Loja.xlsx");
    };




    // Função que gera o PDF do gráfico
    const gerarPDF = () => {
        const element = graphRef.current;
        const opt = {
            margin: 0.5,
            filename: "Vendas Período.pdf",
            image: { type: "jpeg", quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
        };
        html2pdf().set(opt).from(element).save();
    };

    // Obter todas as lojas únicas para o cabeçalho
    const todasLojas = useMemo(() => {
        return [...new Set(dadosTabela.flatMap(linha =>
            Object.keys(linha).filter(col => col !== 'modelo' && col !== 'Total')
        ))];
    }, [dadosTabela]);

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
            <div className="panel-heading w-100  align-items-center gap-2" style={{ maxWidth: "1000px" }}>
                <i className="ti ti-money" id="ti-black"></i>
                <p style={{ paddingTop: "15px" }}>VENDAS EM UM PERÍODO (Valor total por loja)</p>
            </div>

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
                        <div style={{ width: "1000px", height: "400px" }}>
                            <Bar data={chartData} options={chartOptions} />
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
                        <h2>Tabela de Valores</h2>
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
                        <div className="d-flex justify-content-start w-100 " style={{ maxWidth: "1000px" }}>
                            <Button onClick={generateExcel} className="bg-green-500 text-white px-4 py-2 rounded mt-3">
                                GERAR EXCEL
                            </Button>
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