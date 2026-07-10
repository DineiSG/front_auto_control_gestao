import { useState } from "react";
import { apiRequest } from "../services/useAuthenticate";

export function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    async function request(endpoint, options = {}) {
        setLoading(true);
        setError(null);

        try {
            const data = await apiRequest(endpoint, options);
            return data;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }

    return { request, loading, error };
}

//Primeiro a ser chamado na hora de buscar algum dado no backend. 
// Ele é o responsável por fazer a requisição, tratar erros e controlar o estado de loading. 
// Ele usa a função apiRequest para fazer a requisição real, mas adiciona uma camada de controle de estado e tratamento de erros para facilitar o uso em componentes.
/**
 * usa a função apiRequest
 * controla estados de loading
 * controla erros
 * retorna os dados da API
 */