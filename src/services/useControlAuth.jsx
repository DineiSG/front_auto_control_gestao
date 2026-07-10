import { useState } from 'react';

/**Este hook e responsavel por realizar o login e logout do usuario.
 * Ele tambem é responsavel por criar novos usuarios e atualizar os dados do usuario, como senha e email.
*/
export function useControlAuth(endpoint) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const API = import.meta.env.VITE_API_AUTH;

    async function authenticateUser(credentials) {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Credenciais inválidas');
            }

            if (!data.token) {
                throw new Error('Token não recebido do backend');
            }

            sessionStorage.setItem('token', data.token);

            return data;

        } catch (err) {
            console.error('Erro ao tentar realizar o login:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }

    async function createUser(data) {
        console.log("DADOS ENVIADOS:", data);

        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const text = await response.text();
            console.log("RESPOSTA:", text);

            if (!response.ok) throw new Error('Erro ao criar');

            return text;
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function updateData(data) {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${API}${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            console.log('[useUpdateData] PATCH URL ->', `${API}${endpoint}`); // log para depuração

            if (!response.ok) throw new Error('Erro ao atualizar os dados');
            return await response.json(); // Retorna o item atualizado (se a API retornar)
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    return { createUser, authenticateUser, updateData, loading, error };
}