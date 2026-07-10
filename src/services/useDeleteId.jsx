import { useState } from "react";
import { apiRequest } from "../services/useAuthenticate"

export function useDeleteId(endpoint) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function deleteData(id) {
        setLoading(true);
        setError(null);

        try {
            if (!id) {
                throw new Error('Parâmetro "id" é obrigatório para deletar o recurso.');
            }

            const finalEndpoint = `${endpoint}/${encodeURIComponent(id)}`;

            const data = await apiRequest(finalEndpoint, {
                method: "DELETE",
            });

            return data ?? true; // cobre caso de 204 No Content

        } catch (err) {
            const message = err?.message || "Erro ao deletar recurso";
            setError(message);
            return null;

        } finally {
            setLoading(false);
        }
    }

    return { deleteData, loading, error };
}