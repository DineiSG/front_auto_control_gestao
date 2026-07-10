// src/hooks/useLineChart.jsx
import { useState, useMemo } from "react";

/**
 * Hook para gráficos de linha (Chart.js) com estado, carregamento e utilitários.
 * Retorna { data, options, loading, error, updateData, fetchData, addDataPoint, removeLastDataPoint }.
 */
export default function useLineChart(
  initialData = { labels: [], datasets: [] },
  options = {}
) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Opções padrão (seguem a estrutura de options do Chart.js)
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: { display: true, text: "Gráfico de Linha" },
    },
    scales: {
      y: { beginAtZero: true },
    },
  };

  // Mescla RASA (shallow) - se precisar de merge profundo, use uma função especializada
  const chartOptions = useMemo(
    () => ({ ...defaultOptions, ...options }),
    [options]
  );

  // Substitui todos os dados
  const updateData = (newData) => setData(newData);

  // Busca dados de uma API (recebe a função que faz a chamada)
  const fetchData = async (apiCall) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err?.message ?? String(err));
      // opcional: console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Garante que o dataset exista antes de escrever nele
  const ensureDataset = (prevDatasets, index) => {
    const ds = prevDatasets[index];
    if (ds) return prevDatasets;
    const filler = {
      label: `Série ${index + 1}`,
      data: [],
      tension: 0.3,
    };
    const newArr = prevDatasets.slice();
    newArr[index] = filler;
    return newArr;
  };

  // Adiciona um ponto (label + value) no dataset informado
  const addDataPoint = (label, value, datasetIndex = 0) => {
    setData((prev) => {
      const prevLabels = prev.labels || [];
      const prevDatasets = prev.datasets || [];
      const readyDatasets = ensureDataset(prevDatasets, datasetIndex);

      const newDatasets = readyDatasets.map((ds, i) =>
        i === datasetIndex ? { ...ds, data: [...(ds.data || []), value] } : ds
      );

      return {
        ...prev,
        labels: [...prevLabels, label],
        datasets: newDatasets,
      };
    });
  };

  // Remove o último ponto do dataset informado (e o último label)
  const removeLastDataPoint = (datasetIndex = 0) => {
    setData((prev) => {
      const prevLabels = prev.labels || [];
      const prevDatasets = prev.datasets || [];
      if (prevLabels.length === 0 || !prevDatasets[datasetIndex]) return prev;

      const newLabels = prevLabels.slice(0, -1);
      const newDatasets = prevDatasets.map((ds, i) =>
        i === datasetIndex
          ? { ...ds, data: (ds.data || []).slice(0, -1) }
          : ds
      );

      return { ...prev, labels: newLabels, datasets: newDatasets };
    });
  };

  return {
    data,
    options: chartOptions,
    loading,
    error,
    updateData,
    fetchData,
    addDataPoint,
    removeLastDataPoint,
  };
}