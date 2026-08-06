import { useState } from "react";
import { Navigate } from "react-router-dom";
import { obterToken, limparSessao, restaurarSessaoLembrada } from "../utils/authStorage";

/** Verifica se o token JWT está expirado */
function tokenExpirado(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Se o token não tiver data de expiração, considera inválido
    if (!payload.exp) return true;
    return Date.now() > payload.exp * 1000;
  } catch {
    // Token mal formatado — considera expirado
    return true;
  }
}

export default function PrivateRoute({ children }) {
  // Numa aba nova, restaura a sessão lembrada (se "Manter sessão" foi marcado).
  // Usado no inicializador de estado para ser executado apenas uma vez por
  // montagem, sem efeitos laterais durante o render.
  useState(() => restaurarSessaoLembrada());

  const token = obterToken();

  // Sem sessão ativa nesta aba: limpa e redireciona para o login
  if (!token) {
    limparSessao();
    return <Navigate to="/" replace />;
  }

  // Token expirado: limpa e redireciona
  if (tokenExpirado(token)) {
    limparSessao();
    return <Navigate to="/" replace />;
  }

  return children;
}
