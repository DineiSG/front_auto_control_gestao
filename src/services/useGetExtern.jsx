import { useState, useEffect } from 'react';

export function useGetExtern(apiUrl) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('Erro ao buscar dados');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [apiUrl]);

    return { data, loading, error };
}

//Este serviço serve para auxiliar no consumo de API's externas