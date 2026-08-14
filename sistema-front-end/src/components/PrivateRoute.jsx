import { Navigate } from "react-router-dom";
import { obterToken, obterRoles, limparSessao } from "../utils/authStorage";
import { destinoPadrao } from "../utils/roles";

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

/**
 * Protege as rotas privadas.
 *
 * A sessão vive apenas no sessionStorage da aba atual. Numa aba nova (por
 * exemplo, ao copiar e colar uma URL de qualquer tela do sistema), não existe
 * sessão — o utilizador é redirecionado para o login para iniciar sessão de novo.
 *
 * Aceita `negarRoles` (lista de papéis SEM acesso à rota): o utilizador é
 * redirecionado para a página inicial adequada ao seu papel.
 */
export default function PrivateRoute({ children, negarRoles }) {
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

  // Restrição opcional por papel (lista de papéis bloqueados da rota)
  if (negarRoles && negarRoles.length > 0) {
    const roles = obterRoles().map((r) => r.toUpperCase());
    if (roles.some((r) => negarRoles.includes(r))) {
      return <Navigate to={destinoPadrao(obterRoles())} replace />;
    }
  }

  return children;
}
