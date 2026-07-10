import { useState, useEffect } from "react";
import { apiRequest } from "../services/useAuthenticate"

/**
 * Hook para buscar dados de uma API, filtrando por um parâmetro
 * e ordenando do mais antigo para o mais novo.
 *
 * @param {string} apiUrl - URL da API
 * @param {string} filterField - Nome do campo a filtrar (ex: "placa")
 * @param {string | number} filterValue - Valor a buscar (ex: "ABC1234")
 */

export function useGetArray(endpoint, filterField, filterValue) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const result = await apiRequest(endpoint, {
          method: "GET",
        });

        if (!Array.isArray(result)) {
          throw new Error("Resposta da API não é uma lista válida");
        }

        let filtered = result;

        // Só filtra se tiver os parâmetros
        if (filterField && filterValue !== undefined) {
          filtered = result.filter((item) => {
            const fieldValue = item?.[filterField];

            if (fieldValue === undefined || fieldValue === null) return false;

            if (typeof fieldValue === "number") {
              return Number(fieldValue) === Number(filterValue);
            }

            return (
              String(fieldValue).toUpperCase() ===
              String(filterValue).toUpperCase()
            );
          });
        }

        setData(filtered);

      } catch (err) {
        setError(err?.message || "Erro ao buscar dados");
        setData([]);

      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [endpoint, filterField, filterValue]);

  return { data, loading, error };
}