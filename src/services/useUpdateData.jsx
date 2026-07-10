import { useState } from 'react';

export function useUpdateData(endpoint) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL =import.meta.env.VITE_API_BASE_URL;

  // Função para atualizar um item com base no ID
  async function updateData(data) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      console.log('[useUpdateData] PATCH URL ->', `${API_BASE_URL}${endpoint}`); // log para depuração

      if (!response.ok) throw new Error('Erro ao atualizar os dados');
      return await response.json(); // Retorna o item atualizado (se a API retornar)
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return { updateData, loading, error }; 
}