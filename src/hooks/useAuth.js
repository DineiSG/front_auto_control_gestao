import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export function useAuth(){
   return useContext(AuthContext);
}

/**
 * Permite acessar o estado de autenticação do usuario e as funções de login e logout
 * usa o AuthContext para compartilhar informações de autenticação em toda a aplicação.
 */