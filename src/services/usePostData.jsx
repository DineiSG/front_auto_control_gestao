import { useState } from 'react';
import { apiRequest } from "../services/useAuthenticate"

export function usePostData(endpoint) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function createData(payload) {
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      return data;

    } catch (err) {
      const message = err?.message || "Erro ao criar recurso";
      setError(message);
      return null;

    } finally {
      setLoading(false);
    }
  }

  return { createData, loading, error };
}