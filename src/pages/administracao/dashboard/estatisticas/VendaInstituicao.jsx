import { useRef, useState, useEffect, useMemo } from "react";
import html2pdf from "html2pdf.js";
import { Bar } from "react-chartjs-2";
import Button from "../../../../components/button/Button";
import Input from "../../../../components/input/Input";
import { useGetArray } from "../../../../services/useGetArray";
import useGroupedChart from "../../../../hooks/useGroupedChart";
import { useFilterPeriodo } from "../../../../hooks/useFilterPeriodo";
import ModalContent from "../../../../components/modal/ModalContent";
import * as XLSX from 'xlsx';

const VendaInstituicao = () => {
    const [dadosTabela, setDadosTabela] = useState([]);
    const [modalAberto, setModalAberto] = useState(false);

    const { data: vendas = [] } = useGetArray("/vendas");

    // Função para processar os dados e estruturar para a tabela
    const processarDadosTabela = (filteredData) => {

        if (!Array.isArray(filteredData)) {
            return [];
        }
        // Mapa para armazenar os totais por loja e instituição
        const lojaInstituicaoMap = {};

        // Agrupar e somar valores por loja e instituição
        filteredData.forEach((venda) => {
            const { unidade, instituicao, valorFinanciamento } = venda;
            const valor = parseFloat((valorFinanciamento || "0.0").replace(',', '.'));

            if (!lojaInstituicaoMap[unidade]) {
                lojaInstituicaoMap[unidade] = { Total: 0 };
            }

            if (!lojaInstituicaoMap[unidade][instituicao]) {
                lojaInstituicaoMap[unidade][instituicao] = 0;
            }

            lojaInstituicaoMap[unidade][instituicao] += valor;
            lojaInstituicaoMap[unidade].Total += valor;
        });

        // Converter o mapa em um array estruturado
        return Object.keys(lojaInstituicaoMap).map((loja) => {
            const instituicoes = Object.keys(lojaInstituicaoMap[loja]).filter(key => key !== 'Total');
            const instituicaoComPorcentagem = instituicoes.reduce((acc, instituicao) => {
                const valor = lojaInstituicaoMap[loja][instituicao];
                const total = lojaInstituicaoMap[loja].Total;
                const porcentagem = ((valor / total) * 100).toFixed(2);
                acc[instituicao] = { valor, porcentagem };
                return acc;
            }, {});

            return {
                loja,
                ...instituicaoComPorcentagem,
                Total: lojaInstituicaoMap[loja].Total,
            };
        });
    };

    // Função para calcular totais gerais e porcentagens
    const calcularTotaisGerais = (dados) => {
        if (!dados || dados.length === 0) {
            return { totaisComPorcentagem: {}, totalGeral: 0 };
        }
        const totaisPorInstituicao = {};
        let totalGeral = 0;

        dados.forEach((linha) => {
            Object.keys(linha).forEach((coluna) => {
                if (coluna !== 'loja' && coluna !== 'Total') {
                    const valor = linha[coluna]?.valor || 0;
                    totaisPorInstituicao[coluna] = (totaisPorInstituicao[coluna] || 0) + valor;
                }
            });
            totalGeral += linha.Total || 0;
        });

        // Calcular porcentagens
        const totaisComPorcentagem = Object.keys(totaisPorInstituicao).reduce((acc, coluna) => {
            const valor = totaisPorInstituicao[coluna];
            const porcentagem = ((valor / totalGeral) * 100).toFixed(2);
            acc[coluna] = { valor, porcentagem };
            return acc;
        }, {});

        return { totaisComPorcentagem, totalGeral };
    };

    // Filtragem por período
    const { startDate, endDate, setStartDate, setEndDate, filteredData, status, message, hasResults } = useFilterPeriodo({
        data: vendas,
        dateKey: 'dataRegistro',
    });


    // Função para gerar Excel
    const generateExcel = () => {
        // Verificar se há dados para exportar
        if (!Array.isArray(dadosTabela) || dadosTabela.length === 0) {
            console.warn("Nenhum dado para exportar.");
            return;
        }

        // Obter todas as lojas únicas (mesma lógica usada na renderização)
        const todasLojas = [...new Set(
            dadosTabela.flatMap(linha =>
                Object.keys(linha).filter(col => col !== 'unidade' && col !== 'Total')
            )
        )];

        // Formatar os dados dos modelos
        const formattedData = dadosTabela.map((linha) => {
            const formattedRow = { Loja: linha.loja };

            // Para cada loja, adicionar valor e porcentagem
            todasLojas.forEach(loja => {
                const dado = linha[loja] || { valor: 0, porcentagem: "0.00" };
                formattedRow[`${loja} (R$)`] = parseFloat(dado.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0,00';
                formattedRow[`${loja} (%)`] = dado.porcentagem;
            });

            formattedRow["Total (R$)"] = parseFloat(linha.Total).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            return formattedRow;
        });

        // Linha de TOTAL GERAL
        const totaisGeraisRow = { Loja: "TOTAL GERAL" };

        totaisGeraisRow["Total (R$)"] = parseFloat(totalGeral).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        formattedData.push(totaisGeraisRow);

        // Definir ordem das colunas: Modelo, [Loja1 (R$), Loja1 (%), ...], Total (R$)
        const columnOrder = [
            "Loja",
            ...todasLojas.flatMap(loja => [`${loja} (R$)`, `${loja} (%)`]),
            "Total (R$)"
        ];

        // Criar planilha
        const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: columnOrder });
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Vendas por Modelo e Loja");

        // Salvar arquivo
        XLSX.writeFile(workbook, "Relatorio_Vendas_por_Instituicao.xlsx");
    };

    // Referência para o gráfico (usado na geração de PDF)
    const graphRef = useRef(null);

    // Dados para o gráfico
    const { chartData, chartOptions } = useGroupedChart({
        data: filteredData,
        datasetLabel: "Vendas por Periodo",
        groupByKey: "instituicao",
        valueKey: "valorFinanciamento",
        aggregate: "sum",
        chartType: "bar",
        sortBy: "value",
        sortOrder: "desc"
    });

    // Função para gerar PDF do gráfico
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

    // Calcular totais gerais sempre que dadosTabela muda
    const { totaisComPorcentagem, totalGeral } = useMemo(() => {
        return calcularTotaisGerais(dadosTabela);
    }, [dadosTabela]);

    // Obter todas as instituições únicas para o cabeçalho
    const todasInstituicoes = useMemo(() => {
        return [...new Set(dadosTabela.flatMap(linha =>
            Object.keys(linha).filter(col => col !== 'loja' && col !== 'Total')
        ))];
    }, [dadosTabela]);

    // Atualiza dadosTabela sempre que filteredData muda
    useEffect(() => {
        const tabela = processarDadosTabela(filteredData);
        setDadosTabela(tabela);
    }, [filteredData]);

    // Função para fechar o modal e limpar as mensagens


    return (
        <div className="d-flex flex-column align-items-center w-100">
            {/* Cabeçalho e seletores de data */}
            <div className="panel-heading w-100 d-flex align-items-center gap-2" style={{ maxWidth: "1000px" }}>
                <i className="ti ti-money" id="ti-black"></i>
                <p>FINANCIAMENTO POR INSTITUIÇÃO FINANCEIRA (Valores de financiamento em um período)</p>
            </div>

            <div className="d-flex align-items-center gap-2 my-3 w-100 justify-content-center" id="date_select">
                <div className="d-flex flex-column">
                    <Input label={"Data Inicial"} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="d-flex flex-column">
                    <Input label={"Data Final"} type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
                </div>
            </div>

            {status !== "ok" && (
                <p className={status === "error" ? "text-danger" : "text-muted"}> {message} </p>
            )}

            {hasResults && (
                <>
                    {/* Gráfico centralizado */}
                    <div ref={graphRef} className="w-100 d-flex justify-content-center my-4">
                        <div style={{ width: "100%", maxWidth: "1000px", height: "400px" }}>
                            <Bar data={chartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Botões de exportação */}
                    <div className="d-flex justify-content-end w-100 px-3" style={{ maxWidth: "1000px" }}>
                        <Button onClick={gerarPDF} className="bg-blue-500 text-white px-4 py-2 rounded mt-3">
                            GERAR PDF
                        </Button>
                    </div>
                    <br />
                    <Button onClick={() => setModalAberto(true)} className="bg-blue-500 text-white px-4 py-2 rounded mt-3">
                        VISUALIZAR TABELA
                    </Button>

                    {/* Tabela com barra de rolagem horizontal */}
                    <ModalContent
                        isOpen={modalAberto}
                        onClose={() => setModalAberto(false)}
                        title=""
                        size="fullscreen"
                    >
                        <h2>Tabela de Valores (Loja X Instituição)</h2>
                        <div className="w-100 d-flex justify-content-center mt-4" style={{ overflowX: "auto" }} >
                            <div className="table-responsive">
                                {dadosTabela.length > 0 ? (
                                    <table className="table table-striped table-light " border="1" cellPadding="5" cellSpacing="0" style={{
                                        minWidth: "max-content",
                                    }}>
                                        <thead>
                                            <tr>
                                                <th>Loja</th>
                                                {todasInstituicoes.map((coluna) => (
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
                                                    <td>{linha.loja}</td>
                                                    {todasInstituicoes.map((coluna) => (
                                                        <>
                                                            <td key={`${coluna}-valor-${index}`} style={{ color: 'blue' }}>
                                                                R$ {linha[coluna]?.valor !== undefined ? Number(linha[coluna].valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'} </td>
                                                            <td key={`${coluna}-porcentagem-${index}`} style={{ color: 'red' }}>
                                                                {linha[coluna]?.porcentagem !== undefined ? `${linha[coluna].porcentagem}%` : '0%'}
                                                            </td>
                                                        </>
                                                    ))}
                                                    <td>R$ {linha.Total !== undefined ? linha.Total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}</td>
                                                </tr>
                                            ))}
                                            <tr>
                                                <td style={{ fontWeight: '700' }}>TOTAL GERAL</td>
                                                {todasInstituicoes.map((coluna) => (
                                                    <>
                                                        <td key={`${coluna}-total`} style={{ color: 'blue' }}>
                                                            R$ {coluna?.valor !== undefined ? Number(coluna.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00'}
                                                        </td>
                                                        <td key={`${coluna}-porcentagem-total`} style={{ color: 'red' }}>
                                                            {totaisComPorcentagem[coluna]?.porcentagem || '0'}%
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
                        <div className="d-flex justify-content-start w-100 " style={{ maxWidth: "1000px" }}>
                            <Button onClick={generateExcel} className="bg-green-500 text-white px-4 py-2 rounded mt-3">
                                GERAR EXCEL
                            </Button>
                        </div>
                    </ModalContent>
                    <br />
                </>
            )}

        </div>
    );
};

export default VendaInstituicao;