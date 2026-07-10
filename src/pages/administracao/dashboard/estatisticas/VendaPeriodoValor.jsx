import { useRef, useState, useEffect, useMemo } from "react";
import html2pdf from "html2pdf.js";
import { Bar } from "react-chartjs-2";
import Button from "../../../../components/button/Button";
import Input from "../../../../components/input/Input"
import { useGetArray } from "../../../../services/useGetArray"
import useGroupedChart from "../../../../hooks/useGroupedChart"; // seu hook atual
import { useFilterPeriodo } from "../../../../hooks/useFilterPeriodo"; // o hook criado acima
import * as XLSX from 'xlsx';

const VendaPeriodoValor = () => {
    const [dadosTabela, setDadosTabela] = useState([]);

    // Busca todas as vendas
    const { data: vendas = [] } = useGetArray("/vendas");
    console.log("Vendas carregadas:", vendas);

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
            const valor = parseFloat((valorVenda || "0.0").replace(',', '.'));

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
                const porcentagem = total > 0 ? ((valor / total) * 100).toFixed(2) : "0.00";
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

    // Função para calcular totais gerais por loja e porcentagens em relação ao total geral
    const calcularTotaisGerais = (dados) => {
        if (!dados || dados.length === 0) {
            return { totaisComPorcentagem: {}, totalGeral: 0 };
        }

        const totaisPorLoja = {};
        let totalGeral = 0;

        dados.forEach((linha) => {
            Object.keys(linha).forEach((coluna) => {
                if (coluna !== 'modelo' && coluna !== 'Total') {
                    const valor = linha[coluna]?.valor || 0;
                    totaisPorLoja[coluna] = (totaisPorLoja[coluna] || 0) + valor;
                }
            });
        });

        // Somar todos os totais por loja para obter o total geral
        totalGeral = Object.values(totaisPorLoja).reduce((soma, valor) => soma + valor, 0);

        // Calcular porcentagens por loja em relação ao total geral
        const totaisComPorcentagem = Object.keys(totaisPorLoja).reduce((acc, loja) => {
            const valor = totaisPorLoja[loja];
            const porcentagem = totalGeral > 0 ? ((valor / totalGeral) * 100).toFixed(2) : "0.00";
            acc[loja] = { valor, porcentagem };
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


    // Hook de período (defina aqui a chave da data na sua venda: "dataVenda", "createdAt", etc.)
    const { startDate, endDate, setStartDate, setEndDate, filteredData, status, message, hasResults, } = useFilterPeriodo({
        sales: vendas,
        dateKey: 'dataRegistro', // <-- ajuste para o nome da sua propriedade de data
    });



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

                    {/* Tabela com barra de rolagem horizontal */}
                    <h5>Tabela de Valores</h5>
                    <div className="w-100 d-flex justify-content-center mt-4">
                        <div className="table-responsive" style={{ maxWidth: "1000px", overflowX: "auto", width: "100%" }}>
                            {dadosTabela.length > 0 ? (
                                <table className="table table-striped table-light " border="1" style={{ minWidth: "800px" }}>
                                    <thead>
                                        <tr>
                                            <th></th>
                                            {todasLojas.map((coluna) => (
                                                <>
                                                    <th key={`${coluna}-valor`} style={{ color: 'blue' }}>{coluna}</th>
                                                    <th key={`${coluna}-porcentagem`} style={{ color: 'red' }}>%{coluna}</th>
                                                </>
                                            ))}
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dadosTabela.map((linha, index) => (
                                            <tr key={index}>
                                                <td>{linha.modelo}</td>
                                                {todasLojas.map((coluna) => (
                                                    <>
                                                        <td key={`${coluna}-valor-${index}`} style={{ color: 'blue' }}>
                                                            R$ {linha[coluna]?.valor !== undefined ? linha[coluna].valor.toFixed(2) : '0.00'}
                                                        </td>
                                                        <td key={`${coluna}-porcentagem-${index}`} style={{ color: 'red' }}>
                                                            {linha[coluna]?.porcentagem !== undefined ? `${linha[coluna].porcentagem}%` : '0%'}
                                                        </td>
                                                    </>
                                                ))}
                                                <td>R$ {linha.Total.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                        <tr>
                                            <td style={{ fontWeight: '700' }}>TOTAL GERAL</td>
                                            {todasLojas.map((coluna) => (
                                                <>
                                                    <td key={`${coluna}-total`} style={{ color: 'blue' }}>
                                                        R$ {totaisComPorcentagem[coluna]?.valor?.toFixed(2) || '0.00'}
                                                    </td>
                                                    <td key={`${coluna}-porcentagem-total`} style={{ color: 'red' }}>
                                                        {totaisComPorcentagem[coluna]?.porcentagem || '0'}%
                                                    </td>
                                                </>
                                            ))}
                                            <td>R$ {totalGeral.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            ) : null}
                        </div>
                    </div>
                    <br />
                    <div className="d-flex justify-content-end w-100 px-3" style={{ maxWidth: "1000px" }}>
                        <Button onClick={generateExcel} className="bg-green-500 text-white px-4 py-2 rounded mt-3">
                            GERAR EXCEL
                        </Button>
                    </div>
                    <br />
                    <br />

                </>
            )}
        </div>
    );
}

export default VendaPeriodoValor