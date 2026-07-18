import { Navigate } from "react-router-dom";

/** Limpa todos os dados de sessão */
function limparSessao() {
  localStorage.removeItem('token');
  localStorage.removeItem('userRoles');
  localStorage.removeItem('userName');
  sessionStorage.removeItem('session_active');
}

/** Verifica se o token JWT está expirado */
function tokenExpirado(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    // Se o token não tiver data de expiração, considera inválido
    if (!payload.exp) return true;
    return Date.now() > payload.exp * 1000;
  } catch (e) {
    // Token mal formatado — considera expirado
    return true;
  }
}

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const sessionActive = sessionStorage.getItem("session_active");

  // Sem token ou nova aba (sessionStorage é por tab): redireciona
  if (!token || !sessionActive) {
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
