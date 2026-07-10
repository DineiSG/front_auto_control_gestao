import { Navigate } from 'react-router-dom';
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children }) {

    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <p>Carregando...</p>; // ou spinner
    }

    if (!isAuthenticated()) {
        return <Navigate to="/" />;
    }

    return children;
}
