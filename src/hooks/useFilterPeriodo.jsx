import { useMemo, useState } from "react";

/**
 * Hook para filtrar uma lista de vendas por período (data inicial e final).
 *
 * @param {Object} params
 * @param {Array<Object>} params.data - Array de vendas completo (ex.: vindo do useGetData("/vendas")).
 * @param {string} [params.dateKey="dataVenda"] - Nome da propriedade no objeto de venda que contém a data.
 *                                                Pode ser "dataVenda", "createdAt", "data", etc.
 *                                                Aceita ISO (ex.: "2025-08-22T13:45:00Z") ou "YYYY-MM-DD".
 * @param {string} [params.initialMessage] - Mensagem inicial (estado sem período).
 * @param {string} [params.emptyMessage] - Mensagem quando não há vendas no período.
 *
 * @returns {{
 *   startDate: string,
 *   endDate: string,
 *   setStartDate: (v: string) => void,
 *   setEndDate: (v: string) => void,
 *   reset: () => void,
 *   filteredData: Array<Object>,
 *   status: 'idle' | 'error' | 'empty' | 'ok',
 *   message: string,
 *   hasResults: boolean
 * }}
 */
export function useFilterPeriodo({
  data,
  dateKey = "dataRegistro",
  initialMessage = "Selecione as datas de inicio e fim para determinar um período para a busca dos registros",
  emptyMessage = "Não houve registros no período selecionado",
}) {
  // Inputs de datas (formatos aceitos pelo <input type="date">: "YYYY-MM-DD")
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Utilitário: transforma valor "YYYY-MM-DD" em Date local no início do dia (00:00:00.000)
  const startOfDayLocalFromInput = (yyyyMMdd) => {
    const [y, m, d] = yyyyMMdd.split("-").map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  };

  // Utilitário: transforma valor "YYYY-MM-DD" em Date local no fim do dia (23:59:59.999)
  const endOfDayLocalFromInput = (yyyyMMdd) => {
    const [y, m, d] = yyyyMMdd.split("-").map(Number);
    return new Date(y, m - 1, d, 23, 59, 59, 999);
  };

  // Utilitário: tenta obter um Date a partir do campo de data de cada venda
  // Aceita ISO completo ou somente data. Retorna null se inválido.
  const parseVendaDate = (value) => {
    if (!value) return null;

    // Se vier apenas "YYYY-MM-DD", converte para meio-dia local para evitar problemas de fuso/DST
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map(Number);
      return new Date(y, m - 1, d, 12, 0, 0, 0);
    }

    const d = new Date(value);
    return isNaN(d) ? null : d;
  };

  // Cálculos derivados (sem efeitos colaterais): dados filtrados, status e mensagem
  const { filteredData, status, message } = useMemo(() => {
    // Estado inicial: sem datas selecionadas
    if (!startDate || !endDate) {
      return {
        filteredData: [],
        status: "idle",
        message: initialMessage,
      };
    }

    // Validação: fim >= início
    const start = startOfDayLocalFromInput(startDate);
    const end = endOfDayLocalFromInput(endDate);
    if (end < start) {
      return {
        filteredData: [],
        status: "error",
        message: "A data final não pode ser anterior à data inicial.",
      };
    }

    // Filtro inclusivo: [início 00:00, fim 23:59]
    const list = Array.isArray(data) ? data : [];
    const filtered = list.filter((row) => {
      const d = parseVendaDate(row?.[dateKey]);
      console.log({
        registro: row?.[dateKey],
        dataConvertida: d,
        inicio: start,
        fim: end,
        passou: d >= start && d <= end
      });
      if (!d) return false;
      return d >= start && d <= end;
    });

    if (filtered.length === 0) {
      return {
        filteredData: [],
        status: "empty",
        message: emptyMessage,
      };
    }

    return {
      filteredData: filtered,
      status: "ok",
      message: "",
    };
  }, [data, startDate, endDate, dateKey, initialMessage, emptyMessage]);

  // Limpa inputs e volta ao estado inicial
  const reset = () => {
    setStartDate("");
    setEndDate("");
  };

  return { startDate, endDate, setStartDate, setEndDate, reset, filteredData, status, message, hasResults: status === "ok", };
}