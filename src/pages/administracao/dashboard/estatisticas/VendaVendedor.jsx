import { useState, useRef } from "react";
import html2pdf from "html2pdf.js";
import { Bar } from "react-chartjs-2";
import Button from "../../../../components/button/Button";
import Input from "../../../../components/input/Input"
import { useGetArray } from "../../../../services/useGetArray"
import { useGetData } from "../../../../services/useGetData"
import useGroupedChart from "../../../../hooks/useGroupedChart"; // seu hook atual
import { useFilterPeriodo } from "../../../../hooks/useFilterPeriodo"; // o hook criado acima
import { formatDateInfo } from "../../../../hooks/formatDate"

const VendaVendedor = () => {

    const [unidade, setUnidade] = useState('')

    // Busca todas as vendas
    const { data: vendas = [] } = useGetArray(`/vendas`);

    // Busca dados das lojas
    const { data: dadosLoja } = useGetData(`/lojas`)

    // Ordena as lojas por descrição
    const lojasOrdenadas = dadosLoja.sort((a, b) => a.descricao.localeCompare(b.descricao))



    // Hook de período (defina aqui a chave da data na sua venda: "dataVenda", "createdAt", etc.)
    const { startDate, endDate, setStartDate, setEndDate, filteredData, status, message, hasResults, } = useFilterPeriodo({
        data: vendas,
        dateKey: 'dataRegistro', // <-- ajuste para o nome da sua propriedade de data

    });

    // Ref do container do gráfico para gerar PDF
    const graphRef = useRef(null);

    // Filtra as vendas pela unidade selecionada (loja)
    const filtroLoja = filteredData.filter(venda => {
        return unidade === null ||
            venda.unidade?.toLowerCase().includes(unidade.toLowerCase());
    });

    const temVendas = filtroLoja.length > 0

    // Geração dos dados do gráfico a partir APENAS das vendas filtradas
    const { chartData, chartOptions } = useGroupedChart({
        data: temVendas ? filtroLoja : [], // Periodo selecionado + filtro de loja
        datasetLabel: "Vendas por Periodo",
        groupByKey: "vendedor", // <- agrupa por nome do vendedor
        aggregate: "count",
        chartType: "bar",
        sortBy: "value",
        sortOrder: "desc",
    });

    // Função que gera o PDF do gráfico
    const gerarPDF = () => {
        const element = graphRef.current

        const opt = {
            margin: [0.5, 0.5, 0.8, 0.5],//[superior, esquerda, inferior, direita]
            filename: "Vendas por Vendedor - Qtd X Periodo",
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

    const handleUnidadeChange = (e) => {
        const selectedOption = e.target.selectedOptions[0]
        const descricao = selectedOption.getAttribute('data-descricao')

        setUnidade(descricao)
        console.log('State atualizado - Loja:', descricao);
    }

    return (
        <div className="d-flex flex-column align-items-center w-100">
            {/* Cabeçalho */}
            {!hasResults && (
                <div className="panel-heading w-100  align-items-center gap-2" style={{ maxWidth: "1000px" }}>
                    <i className="ti ti-money" id="ti-black" style={{ marginRight: "5px" }} />
                    <h4 style={{ paddingTop: "15px" }}> VENDAS POR VENDEDOR (Por período) </h4>
                </div>
            )}

            {/* Filtros de período */}
            <div className="d-flex align-items-center gap-4 my-3" id="date_select">
                {/* Input de Data Início */}
                <div className="d-flex flex-column col-md-4">
                    <Input label={"Data Inicial"} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>

                {/* Input de Data Fim */}
                <div className="d-flex flex-column col-md-4">
                    <Input label={"Data Final"} type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} />
                </div>
                <label className="label" id="select-label"><span>Loja:</span></label>
                <select type='text' name='loja' value={unidade} onChange={handleUnidadeChange} className="select-item" required >
                    <option value="" >TODAS</option>
                    {lojasOrdenadas.map((loja) => (
                        <option key={loja.descricao} value={loja.descricao} data-descricao={loja.descricao}>
                            {loja.descricao}
                        </option>
                    ))}
                </select>
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
                                <i className="ti ti-money" id="ti-black" style={{ marginRight: "5px" }} />
                                <h4 style={{ paddingTop: "15px" }}> VENDAS POR VENDEDOR (Quantidade de vendas em um período)</h4>
                            </div>
                            <p>Periodo: de <strong>{formatDateInfo(startDate)} </strong>a <strong>{formatDateInfo(endDate)}</strong></p>
                            <p>Loja: <strong>{unidade ? unidade : "TODAS"}</strong></p>

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
                </>
            )}
        </div>
    );
}

export default VendaVendedor
