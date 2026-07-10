import { useMemo } from "react";

/**
 * useGroupPercent({
 *   data,            // array cru (ex: [{ marca: 'Toyota' }, ...])
 *   groupByKey,      // chave para agrupar (ex: "marca")
 *   datasetLabel = "Quantidade",   // rótulo para dataset de contagem
 *   percentLabel = "Porcentagem",  // rótulo para dataset de porcentagem
 *   sortBy = "value",   // 'value' | 'key'
 *   sortOrder = "desc", // 'asc' | 'desc'
 *   palette = null,     // array de cores ou null para padrão
 *   round = 2,          // casas decimais para porcentagens
 * })
 *
 * Retorna:
 * { total, counts, percentages, chartDataCounts, chartDataPercentages, chartOptions }
 */
export default function useGroupPercent({
  data,
  groupByKey,
  datasetLabel = "Quantidade",
  percentLabel = "Porcentagem",
  sortBy = "value",
  sortOrder = "desc",
  palette = null,
  round = 2,
}) {
  const defaultPalette = [
    "#4dc9f6", "#f67019", "#f53794", "#537bc4",
    "#acc236", "#166a8f", "#00a950", "#58595b", "#8549ba"
  ];

  const {
    total,
    counts,
    percentages,
    labels,
    countValues,
    percentValues,
    backgroundColors,
  } = useMemo(() => {
    // segurança: garante array
    const safe = Array.isArray(data) ? data : [];

    // 1) contador por chave
    const map = safe.reduce((acc, item) => {
      const key = String(item?.[groupByKey] ?? "—"); // trata undefined/null
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    // 2) total geral
    const totalCount = Object.values(map).reduce((s, v) => s + v, 0);

    // 3) porcentagens por chave (valor em 0..100)
    const perc = {};
    Object.keys(map).forEach((k) => {
      const raw = totalCount > 0 ? (map[k] / totalCount) * 100 : 0;
      // arredonda com Number para evitar strings
      perc[k] = Number(raw.toFixed(round));
    });

    // 4) ordenar entries conforme preferencia
    const entries = Object.entries(map).sort((a, b) => {
      if (sortBy === "key") {
        return sortOrder === "asc" ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0]);
      } else {
        // sortBy === 'value'
        return sortOrder === "asc" ? a[1] - b[1] : b[1] - a[1];
      }
    });

    const lbls = entries.map(([k]) => k);
    const cntVals = entries.map(([, v]) => v);
    const pctVals = lbls.map((l) => perc[l]);

    // 5) cores
    const usePalette = Array.isArray(palette) && palette.length > 0 ? palette : defaultPalette;
    const bgColors = lbls.map((_, i) => usePalette[i % usePalette.length]);

    return {
      total: totalCount,
      counts: map,
      percentages: perc,
      labels: lbls,
      countValues: cntVals,
      percentValues: pctVals,
      backgroundColors: bgColors,
    };
  }, [data, groupByKey, sortBy, sortOrder, palette, round]);

  // 6) chartData prontos para Chart.js (counts e percentages)
  const chartDataCounts = useMemo(() => ({
    labels,
    datasets: [
      {
        label: datasetLabel,
        data: countValues,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  }), [labels, countValues, backgroundColors, datasetLabel]);

  const chartDataPercentages = useMemo(() => ({
    labels,
    datasets: [
      {
        label: percentLabel,
        data: percentValues,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors,
        borderWidth: 1,
      },
    ],
  }), [labels, percentValues, backgroundColors, percentLabel]);

  // 7) opções padrão reutilizáveis (pode ser sobrescrito no componente)
const chartOptions = useMemo(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { 
      position: "right",
      labels: {
        generateLabels: function (chart) {
          const data = chart.data;
          if (!data.datasets.length) return [];

          return data.labels.map((label, i) => {
            const dataset = data.datasets[0]; // pega o primeiro dataset
            const value = dataset.data[i];    // valor correspondente
            const pct = percentValues && percentValues[i] != null ? percentValues[i] : null;

            return {
              text: pct != null ? `${label}: ${value} (${pct}%)` : `${label}: ${value}`,
              fillStyle: dataset.backgroundColor[i], // cor da bolinha
              hidden: isNaN(value) || value === null,
              strokeStyle: dataset.borderColor ? dataset.borderColor[i] : undefined,
              lineWidth: 1,
              index: i
            };
          });
        }
      }
    },
    title: { display: false, text: datasetLabel },
    tooltip: {
      callbacks: {
        label: function (context) {
          const label = context.dataset.label ?? "";
          const value = context.parsed ?? context.raw;

          // se dataset for de porcentagem
          if (context.dataset.label && /porcentagem|percent|%/i.test(context.dataset.label)) {
            return `${label}: ${value}%`;
          }

          const idx = context.dataIndex;
          const pct = percentValues && percentValues[idx] != null ? percentValues[idx] : null;
          return pct != null ? `${label}: ${value} (${pct}%)` : `${label}: ${value}`;
        },
      },
    },
  },
}), [datasetLabel, percentValues]);

  return {
    total,
    counts,
    percentages,
    chartDataCounts,
    chartDataPercentages,
    chartOptions,
  };
}