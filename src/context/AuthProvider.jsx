import { useState } from "react";
import { jwtDecode } from "jwt-decode";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {

  const [token, setToken] = useState(() =>
    sessionStorage.getItem("token")
  );

  const [user, setUser] = useState(() => {
    const stored = sessionStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const isAuthenticated = () => !!token;

  // LOGIN COM DECODE
  const login = (token) => {
    const decoded = jwtDecode(token);

    const userData = {
      nome: decoded.sub,
      role: decoded.r
    };

    sessionStorage.setItem("token", token);
    sessionStorage.setItem("user", JSON.stringify(userData));

    setToken(token);
    setUser(userData);
  };

  const logout = () => {
    sessionStorage.clear();
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}