import React, { createContext, useContext, useMemo, useState } from "react";
import api from "./api.js";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("kt_user") || "null");
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [token, setToken] = useState(() => localStorage.getItem("kt_token") || "");

  async function login(email, password, role = "student") {
    const response = await api.post("/auth/login", { email, password, role });
    const data = response.data;
    localStorage.setItem("kt_token", data.token);
    localStorage.setItem("kt_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function register(studentData) {
    const response = await api.post("/auth/register", studentData);
    const data = response.data;
    localStorage.setItem("kt_token", data.token);
    localStorage.setItem("kt_user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem("kt_token");
    localStorage.removeItem("kt_user");
    setToken("");
    setUser(null);
  }

  const value = useMemo(() => ({ user, token, login, register, logout }), [user, token]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
