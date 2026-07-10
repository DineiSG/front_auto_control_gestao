import "chart.js/auto";
import { Pie } from "react-chartjs-2";
import { useGetData } from "../../../../services/useGetData";// seu hook de fetch (mock abaixo)
import useGroupPercent from "../../../../hooks/useGroupPercent";
import useGroupedChart from "../../../../hooks/useGroupedChart";
import Button from "../../../../components/button/Button";
import html2pdf from 'html2pdf.js'
import { useRef } from "react";

const Estoque = () => {

    const { data } = useGetData(`/veiculos`)

    const graphRef = useRef(null);

    //Recebendo as configurações do hook useGroupPercent
    const { total, chartOptions } = useGroupPercent({
        data: data ?? [],
        groupByKey: "unidade",
        datasetLabel: "Estoque por loja ",
        percentLabel: "Percentual (%)",
        sortBy: "value",
        sortOrder: "desc",
        round: 1,
    });

    const { chartData } = useGroupedChart({
        data: data ?? [],
        datasetLabel: "",
        groupByKey: "unidade",
        aggregate: "count",
        chartType: "bar",
        sortBy: "value",
        sortOrder: "desc"
    });

    //Funçao que gera o PDF do grafico
    const gerarPDF = () => {
        const element = graphRef.current;
        const opt = {
            margin: 0.5,
            filename: 'Estoque Loja.pdf',
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' }
        };

        html2pdf().set(opt).from(element).save();
    };

    return (
        <div>
            <div className="panel-heading" style={{ maxWidth: "1000px" }}>
                <i className='ti ti-bar-chart-alt' id="ti-black" style={{ marginRight: "5px" }} ></i>
                <p style={{ paddingTop: "5px" }}>ESTOQUE DAS LOJAS<br /> TOTAL: {total} veiculos </p>
            </div>
            <div style={{ width: "1000px", height: "400px", alignItems: "center" }} ref={graphRef}>
                <div style={{ height: 260 }}  >
                    <Pie options={chartOptions} data={chartData} id="graficos" />
                </div>
            </div>
            <div className="d-flex justify-content-end w-100 px-3" style={{ maxWidth: "1000px" }}>
                <Button onClick={gerarPDF} className="bg-blue-500 text-white px-4 py-2 rounded mt-3">
                    GERAR PDF
                </Button>
            </div>
        </div>
    )
}

export default Estoque
