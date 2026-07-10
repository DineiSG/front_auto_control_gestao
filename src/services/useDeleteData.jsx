import { useState } from "react";
import { apiRequest } from "../services/useAuthenticate"

export function useDeleteData(endpoint) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function deleteData(placa) {
        setLoading(true);
        setError(null);

        try {
            if (!placa) {
                throw new Error('Parâmetro "placa" é obrigatório para deletar.');
            }

            const finalEndpoint = `${endpoint}/placa/${encodeURIComponent(placa)}`;

            const data = await apiRequest(finalEndpoint, {
                method: "DELETE",
            });

            return data ?? true; // caso API retorne 204 (sem conteúdo)

        } catch (err) {
            const message = err?.message || "Erro ao deletar registro";
            setError(message);
            return null;

        } finally {
            setLoading(false);
        }
    }

    return { deleteData, loading, error };
}