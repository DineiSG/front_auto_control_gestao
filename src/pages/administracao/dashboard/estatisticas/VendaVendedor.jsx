import { useRef } from "react";
import html2pdf from "html2pdf.js";
import { Bar } from "react-chartjs-2";
import Button from "../../../../components/button/Button";
import Input from "../../../../components/input/Input"
import { useGetArray } from "../../../../services/useGetArray"
import useGroupedChart from "../../../../hooks/useGroupedChart"; // seu hook atual
import { useFilterPeriodo } from "../../../../hooks/useFilterPeriodo"; // o hook criado acima

const VendaVendedor = () => {
    // Busca todas as vendas
    const { data: vendas = [] } = useGetArray("/vendas");



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
        groupByKey: "vendedor",
        aggregate: "count",
        chartType: "bar",
        sortBy: "value",
        sortOrder: "desc",
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

    return (
        <div className="d-flex flex-column align-items-center w-100">
            {/* Cabeçalho */}
            <div className="panel-heading w-100  align-items-center gap-2" style={{ maxWidth: "1000px" }}>
                <i className="ti ti-money" id="ti-black" style={{ marginRight: "5px" }} />
                <p style={{ paddingTop: "15px" }}> VENDAS POR VENDEDOR (Por período) </p>
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
                </>
            )}
        </div>
    );
}

export default VendaVendedor
