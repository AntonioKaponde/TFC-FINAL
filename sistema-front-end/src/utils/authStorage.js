/**
 * Gestão de sessão por aba.
 *
 * Problema resolvido: o localStorage é partilhado entre todas as abas do Chrome
 * (mesma origem), por isso dois utilizadores em abas diferentes "pisavam" o token
 * um do outro e todas as abas acabavam com o mesmo utilizador.
 *
 * Solução:
 * - sessionStorage → isolado POR ABA. É aqui que fica a sessão ativa de cada aba,
 *   permitindo ter utilizadores diferentes em abas diferentes ao mesmo tempo.
 * - localStorage    → apenas quando o utilizador marca "Manter sessão neste
 *   dispositivo". Serve para restaurar a última sessão lembrada numa aba nova
 *   (ou depois de fechar e reabrir o browser).
 */

const CHAVES = ['token', 'userName', 'userRoles', 'primeiroAcesso'];

/** Guarda a sessão na aba atual e (se `lembrar`) no localStorage. */
export function guardarSessao({ token, nome, roles, primeiroAcesso = false, lembrar = true }) {
  // Sessão da aba atual (sempre)
  sessionStorage.setItem('token', token);
  sessionStorage.setItem('session_active', 'true');
  if (nome) sessionStorage.setItem('userName', nome);
  if (roles) sessionStorage.setItem('userRoles', JSON.stringify(roles));
  if (primeiroAcesso) sessionStorage.setItem('primeiroAcesso', 'true');
  else sessionStorage.removeItem('primeiroAcesso');

  // Persistência opcional (Manter sessão)
  if (lembrar) {
    localStorage.setItem('token', token);
    if (nome) localStorage.setItem('userName', nome);
    if (roles) localStorage.setItem('userRoles', JSON.stringify(roles));
    if (primeiroAcesso) localStorage.setItem('primeiroAcesso', 'true');
    else localStorage.removeItem('primeiroAcesso');
  }
}

/** Token da aba atual; se não existir, o da sessão lembrada. */
export function obterToken() {
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

/** Nome do utilizador da sessão da aba atual (com fallback para a lembrada). */
export function obterNome() {
  return sessionStorage.getItem('userName') || localStorage.getItem('userName');
}

/** Lista de papéis do utilizador da aba atual (com fallback para a lembrada). */
export function obterRoles() {
  const raw = sessionStorage.getItem('userRoles') || localStorage.getItem('userRoles') || '[]';
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** True se o utilizador ainda tem de trocar a palavra-passe no primeiro acesso. */
export function obterPrimeiroAcesso() {
  return (sessionStorage.getItem('primeiroAcesso') || localStorage.getItem('primeiroAcesso')) === 'true';
}

/** Remove apenas a marca de "primeiro acesso" (após trocar a palavra-passe). */
export function removerPrimeiroAcesso() {
  sessionStorage.removeItem('primeiroAcesso');
  localStorage.removeItem('primeiroAcesso');
}

/**
 * Numa aba nova sem sessão ativa, restaura a sessão lembrada (localStorage).
 * Devolve true se a aba passou a ter sessão.
 */
export function restaurarSessaoLembrada() {
  // Se esta aba já tem sessão ativa (ex.: refresh), não sobrescreve.
  if (sessionStorage.getItem('session_active')) return true;

  const token = localStorage.getItem('token');
  if (!token) return false;

  sessionStorage.setItem('token', token);
  sessionStorage.setItem('session_active', 'true');
  const nome = localStorage.getItem('userName');
  if (nome) sessionStorage.setItem('userName', nome);
  const roles = localStorage.getItem('userRoles');
  if (roles) sessionStorage.setItem('userRoles', roles);
  const primeiroAcesso = localStorage.getItem('primeiroAcesso');
  if (primeiroAcesso) sessionStorage.setItem('primeiroAcesso', primeiroAcesso);
  return true;
}

/**
 * Termina a sessão da aba atual. Se a sessão lembrada (localStorage) pertencer
 * ao mesmo utilizador desta aba, também é removida (logout completo).
 */
export function limparSessao() {
  const tokenAba = sessionStorage.getItem('token');
  const tokenLembrado = localStorage.getItem('token');

  CHAVES.forEach((chave) => sessionStorage.removeItem(chave));
  sessionStorage.removeItem('session_active');

  if (tokenLembrado && tokenAba && tokenLembrado === tokenAba) {
    CHAVES.forEach((chave) => localStorage.removeItem(chave));
  }
}
