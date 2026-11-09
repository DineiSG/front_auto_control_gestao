import "chart.js/auto";
import { Bar } from "react-chartjs-2";
import { useGetData } from "../../../../services/useGetData"
import useGroupedChart from "../../../../hooks/useGroupedChart";
import { useRef } from "react";
import html2pdf from 'html2pdf.js'
import Button from "../../../../components/button/Button";

const AnoModelo = () => {

  const { data } = useGetData("/veiculos")

  const graphRef = useRef(null);

  const { chartData, chartOptions } = useGroupedChart({
    data: data ?? [],
    datasetLabel: "",
    groupByKey: "ano_modelo",
    aggregate: "count",
    chartType: "bar",
    sortBy: "value",
    sortOrder: "desc"
  });

  //Funçao que gera o PDF do grafico
  const gerarPDF = () => {
    const element = graphRef.current;

    const opt = {
      margin: [0.8, 0.5, 0.8, 0.5], //[superior, esquerda, inferior, direita]
      filename: 'Estoque Por Ano Modelo.pdf',
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

  return (
    <div className="d-flex flex-column align-items-center w-100">
      <div ref={graphRef}>
        <img src="./aspa.png" alt="Logomarca da empresa" className="relatorio-logo" />
        <br />
        <br />
        <div className="conteudo-relatorio">
          <div className="panel-heading w-100  align-items-center gap-2" style={{ maxWidth: "1000px" }}>
            <i className='ti ti-bar-chart-alt' id="ti-black" style={{ marginRight: "5px" }} />
            <h4 style={{ paddingTop: "25px" }} >VEICULOS POR ANO MODELO </h4>
          </div>
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
    </div>

  );
}

export default AnoModelo
