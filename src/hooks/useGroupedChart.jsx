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
  valueType = "number", // "currency" | "number" | "raw"
  options = {},
}) {

  const defaultPalette = [
    "#4dc9f6", "#f67019", "#f53794", "#537bc4",
    "#acc236", "#166a8f", "#00a950", "#58595b", "#8549ba"
  ];

  // Função utilitária para formatar valores no padrão brasileiro (pt-BR)
  const formatValue = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return val;

    if (valueType === "currency") {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(val);
    }

    if (valueType === "number") {
      return new Intl.NumberFormat('pt-BR', {
        maximumFractionDigits: 2,
      }).format(val);
    }

    return val;
  };

  const { chartData, grouped } = useMemo(() => {
    const safe = Array.isArray(data) ? data : [];

    // util: parse strings numéricas considerando "1.234,56", "1234.56" e "R$ 1.234,56"
    const parseNumberString = (str) => {
      if (str == null) return NaN;
      const s = String(str).trim();
      if (s === '') return NaN;

      if (s.includes('.') && s.includes(',')) {
        return parseFloat(s.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '.'));
      }
      if (s.includes(',') && !s.includes('.')) {
        return parseFloat(s.replace(',', '.').replace(/[^\d.-]/g, ''));
      }
      return parseFloat(s.replace(/[^\d.-]/g, ''));
    };

    // util: resolve path "a.b.c" ou função
    const getValue = (item) => {
      if (!valueKey) return 0;

      if (typeof valueKey === 'function') {
        const v = valueKey(item);
        return Number.isFinite(Number(v)) ? Number(v) : 0;
      }

      let raw;
      if (typeof valueKey === 'string') {
        raw = valueKey.split('.').reduce((o, k) => (o ? o[k] : undefined), item);
      } else {
        raw = item?.[valueKey];
      }

      if (raw == null) return 0;
      if (typeof raw === 'number') return Number.isFinite(raw) ? raw : 0;

      const parsed = parseNumberString(raw);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    // Agrupar e agregar (soma + count)
    const map = {};
    safe.forEach((item) => {
      const key = String(item?.[groupByKey] ?? '—');
      if (!map[key]) map[key] = { sum: 0, count: 0 };

      const val = getValue(item);
      map[key].count += 1;
      map[key].sum += val;
    });

    // Produzir valores finais conforme aggregate
    const groupedObj = {};
    Object.keys(map).forEach((k) => {
      if (aggregate === 'sum') groupedObj[k] = map[k].sum;
      else if (aggregate === 'avg') groupedObj[k] = map[k].count === 0 ? 0 : map[k].sum / map[k].count;
      else groupedObj[k] = map[k].count;
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
        position: "bottom",
        labels: {
          generateLabels: function (chart) {
            const data = chart.data;
            if (!data.datasets.length) return [];

            const dataset = data.datasets[0];

            return data.labels.map((label, i) => {
              const value = dataset.data[i];
              return {
                text: `${label}: ${formatValue(value)}`, // Aplica a formatação aqui
                fillStyle: Array.isArray(dataset.backgroundColor)
                  ? dataset.backgroundColor[i]
                  : dataset.backgroundColor,
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
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || '';
            const value = context.parsed.y ?? context.parsed;
            return `${label}: ${formatValue(value)}`; // Aplica a formatação no tooltip
          }
        }
      },
      title: { display: false, text: datasetLabel },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function (value) {
            return formatValue(value); // Aplica a formatação no eixo Y
          }
        }
      },
    },
  };

  const chartOptions = useMemo(() => {
    return { ...defaultOptions, ...options };
  }, [options, datasetLabel, valueType]);

  return { chartData, chartOptions, grouped };
}
