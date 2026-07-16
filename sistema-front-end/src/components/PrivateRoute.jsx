import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  const sessionActive = sessionStorage.getItem("session_active");

  if (!token || !sessionActive) {
    // Se não há token ou se é uma nova aba (sem session_active),
    // redireciona para a página de login
    return <Navigate to="/" replace />;
  }

  return children;
}
