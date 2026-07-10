// src/hooks/useGroupedChart.jsx
import { useMemo } from "react";

/**
 * useGroupedChart({
 *   data,               // array cru (ex: [{ marca: 'Toyota', valor: 10 }, ...])
 *   groupByKey,         // chave para agrupar (ex: "marca")
 *   aggregate = 'count' // 'count' | 'sum' | 'avg'
 *   valueKey = null,    // chave numérica quando aggregate === 'sum' or 'avg'
 *   datasetLabel = 'Total',
 *   chartType = 'bar',  // apenas para ajudar a decidir cores (não altera estrutura)
 *   sortBy = 'value',   // 'value' | 'key'
 *   sortOrder = 'desc', // 'asc' | 'desc'
 *   palette = null,     // array de cores opcionais
 *   options = {}        // opções extras do Chart.js (mescla shallow)
 * })
 *
 * Retorna: { chartData, chartOptions, grouped } 
 * - chartData: { labels, datasets } pronto pro Chart.js
 * - chartOptions: opções mescladas (default + options)
 * - grouped: objeto cru de agrupamento { chave: valor }
 */
export default function useGroupedChart({
  data,
  groupByKey,
  aggregate = "count",
  valueKey = null,
  datasetLabel = "Total",
  chartType = "bar",
  sortBy = "value",
  sortOrder = "desc",
  palette = null,
  options = {},
}) {

  const defaultPalette = [
    "#4dc9f6", "#f67019", "#f53794", "#537bc4",
    "#acc236", "#166a8f", "#00a950", "#58595b", "#8549ba"
  ];

 const { chartData, grouped } = useMemo(() => {
  const safe = Array.isArray(data) ? data : [];

  // util: parse strings numéricas considerando "1.234,56" e "1234.56" e "R$ 1.234,56"
  const parseNumberString = (str) => {
    if (str == null) return NaN;
    const s = String(str).trim();
    if (s === '') return NaN;

    // se contém '.' e ',' — assume '.' como milhares e ',' decimal
    if (s.includes('.') && s.includes(',')) {
      return parseFloat(s.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, ''));
    }
    // se contém apenas ',' — troca por '.'
    if (s.includes(',') && !s.includes('.')) {
      return parseFloat(s.replace(',', '.').replace(/[^\d.-]/g, ''));
    }
    // caso simples: remove tudo que não é dígito, '.' ou '-' e parseFloat
    return parseFloat(s.replace(/[^\d.-]/g, ''));
  };

  // util: resolve path "a.b.c" ou função
  const getValue = (item) => {
    if (!valueKey) return 0;

    // se valueKey for função, usa ela (ex.: item => item.qty * item.unitPrice)
    if (typeof valueKey === 'function') {
      const v = valueKey(item);
      return Number.isFinite(Number(v)) ? Number(v) : 0;
    }

    // se for string, pode ser caminho aninhado "order.price"
    let raw;
    if (typeof valueKey === 'string') {
      raw = valueKey.split('.').reduce((o, k) => (o ? o[k] : undefined), item);
    } else {
      raw = item?.[valueKey];
    }

    if (raw == null) return 0;
    if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;
    // string -> tentar parse inteligente
    const parsed = parseNumberString(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // Agrupar e agregar (soma + count)
  const map = {}; // key -> { sum, count }
  safe.forEach((item) => {
    const key = String(item?.[groupByKey] ?? '—');
    if (!map[key]) map[key] = { sum: 0, count: 0 };

    const val = getValue(item); // robusto
    map[key].count += 1;
    map[key].sum += val; // val já 0 se inválido
  });

  // Produzir valores finais conforme aggregate
  const groupedObj = {};
  Object.keys(map).forEach((k) => {
    if (aggregate === 'sum') groupedObj[k] = map[k].sum;
    else if (aggregate === 'avg') groupedObj[k] = map[k].count === 0 ? 0 : map[k].sum / map[k].count;
    else groupedObj[k] = map[k].count; // default count
  });

  // Ordenar entradas
  const entries = Object.entries(groupedObj).sort((a, b) => {
    if (sortBy === 'key') {
      return sortOrder === 'asc' ? a[0].localeCompare(b[0]) : b[0].localeCompare(a[0]);
    } else {
      return sortOrder === 'asc' ? a[1] - b[1] : b[1] - a[1];
    }
  });

  const labels = entries.map(([k]) => k);
  const values = entries.map(([, v]) => v);

  // Paleta e cores
  const usePalette = Array.isArray(palette) && palette.length > 0 ? palette : defaultPalette;
  const backgroundColors = labels.map((_, i) => usePalette[i % usePalette.length]);
  const borderColors = backgroundColors.map((c) => c);

  const dataset = {
    label: datasetLabel,
    data: values,
    backgroundColor: backgroundColors,
    borderColor: borderColors,
    borderWidth: 1,
    fill: false,
  };

  return {
    chartData: { labels, datasets: [dataset] },
    grouped: groupedObj,
  };
}, [data, groupByKey, aggregate, valueKey, datasetLabel, chartType, sortBy, sortOrder, palette, defaultPalette]);

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",   // ou "top", "bottom", "left"
        labels: {
          generateLabels: function (chart) {
            const data = chart.data;
            if (!data.datasets.length) return [];

            const dataset = data.datasets[0]; // pega o primeiro dataset

            return data.labels.map((label, i) => {
              const value = dataset.data[i];
              return {
                text: `${label}: ${value}`,          // aqui coloco label + valor
                fillStyle: Array.isArray(dataset.backgroundColor)
                  ? dataset.backgroundColor[i]
                  : dataset.backgroundColor, // mantém a cor da bolinha
                strokeStyle: dataset.borderColor
                  ? (Array.isArray(dataset.borderColor)
                    ? dataset.borderColor[i]
                    : dataset.borderColor)
                  : undefined,
                lineWidth: 1,
                hidden: isNaN(value) || value === null,
                index: i,
              };
            });
          }
        }
      },
      title: { display: false, text: datasetLabel },
    },
    scales: {
      y: { beginAtZero: false, ticks: { precision: 0 } },
    },
  };


  const chartOptions = useMemo(() => {

    return { ...defaultOptions, ...options };
    // Observação: merge é raso. Para merges profundos use lodash.merge externamente se necessário.
  }, [options, datasetLabel]);

  return { chartData, chartOptions, grouped };
}
