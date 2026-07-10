const API = import.meta.env.VITE_API_BASE_URL;

export async function apiRequest(endpoint, options = {}) {
    const token = sessionStorage.getItem("token");

    const config = {
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` })
        },
        ...options
    };

    const response = await fetch(`${API}${endpoint}`, config);

    if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || "Erro na requisição");
    }

    return response.json();
}

// Segundo a ser chamado na hora de buscar algum dado no backend.
// Ele é o responsável por definir a URL base da API, adicionar automaticamente o token de autenticação,
// padronizar headers, tratar erros de requisição e retornar o JSON já processado. Ele é usado por outros hooks como useApi para facilitar as requisições em componentes.

/**
 * define a URL base da API
 * adiciona automaticamente o token de autenticação
 * padroniza headers
 * trata erros de requisição
 * retorna o JSON já processado
 */