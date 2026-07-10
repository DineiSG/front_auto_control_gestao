import { useState, useEffect } from 'react';
import { apiRequest } from "../services/useAuthenticate"

export function useGetData(endpoint, sortField = null) {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setStatus("loading");
      setError(null);

      try {
        const result = await apiRequest(endpoint, {
          method: "GET",
        });

        let finalData = result;

        // Ordenação opcional
        if (sortField && Array.isArray(result)) {
          finalData = [...result].sort((a, b) => {
            const aValue = a?.[sortField];
            const bValue = b?.[sortField];

            if (!aValue || !bValue) return 0;

            return String(aValue).localeCompare(String(bValue), "pt-BR", {
              sensitivity: "base",
            });
          });
        }

        setData(finalData);
        setStatus("success");

      } catch (err) {
        setError(err?.message || "Erro desconhecido");
        setData(null);
        setStatus("error");
      }
    }

    fetchData();
  }, [endpoint, sortField]);

  return { data, status, error };
}

/*
Novo hook para buscar dados do beckend utilizando o apiRequest.

import { useState, useEffect } from "react";
import { apiRequest } from "../services/apiRequest";

export function useGetData(endpoint) {

    const [data, setData] = useState([]);
    const [status, setStatus] = useState("idle");
    const [error, setError] = useState(null);

    useEffect(() => {

        async function fetchData() {

            setStatus("loading");
            setError(null);

            try {

                const result = await apiRequest(endpoint, {
                    method: "GET"
                });

                setData(result);
                setStatus("success");

            } catch (err) {

                setError(err.message || "Erro desconhecido");
                setStatus("error");

            }

        }

        fetchData();

    }, [endpoint]);

    return { data, status, error };

}
*/