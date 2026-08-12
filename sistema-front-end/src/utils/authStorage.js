/**
 * Gestão de sessão por aba.
 *
 * A sessão é isolada POR ABA (sessionStorage): cada aba do browser tem a sua
 * própria sessão e o token nunca é partilhado entre abas.
 *
 * Consequência pretendida: ao abrir uma URL do sistema numa aba nova (ex.:
 * copiar/colar o link de uma fatura ou de qualquer outra tela), a nova aba
 * começa SEM sessão e é redirecionada para o login, onde o utilizador volta
 * a iniciar sessão. Só na aba onde o utilizador se autenticou é que a sessão
 * existe.
 *
 * O refresh (F5) na MESMA aba mantém a sessão, porque o sessionStorage
 * sobrevive ao recarregamento da página.
 */

const CHAVES = ['token', 'userName', 'userRoles', 'primeiroAcesso'];

/** Guarda a sessão apenas na aba atual (sessionStorage). */
export function guardarSessao({ token, nome, roles, primeiroAcesso = false }) {
  sessionStorage.setItem('token', token);
  if (nome) sessionStorage.setItem('userName', nome);
  if (roles) sessionStorage.setItem('userRoles', JSON.stringify(roles));
  if (primeiroAcesso) sessionStorage.setItem('primeiroAcesso', 'true');
  else sessionStorage.removeItem('primeiroAcesso');
}

/** Token da sessão da aba atual. */
export function obterToken() {
  return sessionStorage.getItem('token');
}

/** Nome do utilizador da sessão da aba atual. */
export function obterNome() {
  return sessionStorage.getItem('userName');
}

/** Lista de papéis do utilizador da sessão da aba atual. */
export function obterRoles() {
  const raw = sessionStorage.getItem('userRoles') || '[]';
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/** True se o utilizador ainda tem de trocar a palavra-passe no primeiro acesso. */
export function obterPrimeiroAcesso() {
  return sessionStorage.getItem('primeiroAcesso') === 'true';
}

/** Remove apenas a marca de "primeiro acesso" (após trocar a palavra-passe). */
export function removerPrimeiroAcesso() {
  sessionStorage.removeItem('primeiroAcesso');
  // Limpeza de dados legados de versões antigas que usavam localStorage
  localStorage.removeItem('primeiroAcesso');
}

/**
 * Termina a sessão da aba atual. Também remove eventuais dados antigos do
 * localStorage (sessões "lembradas" de versões anteriores do sistema), para
 * que nenhum token antigo fique pendurado no dispositivo.
 */
export function limparSessao() {
  CHAVES.forEach((chave) => sessionStorage.removeItem(chave));
  // Limpeza de dados legados (versões antigas guardavam a sessão em localStorage)
  CHAVES.forEach((chave) => localStorage.removeItem(chave));
}
