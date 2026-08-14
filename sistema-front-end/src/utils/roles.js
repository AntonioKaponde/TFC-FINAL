/**
 * Variantes do papel de "gestor de estoque" (Gerente de estoque / Gestor de
 * estoque / Gerente) conforme o nome guardado na base de dados. Este papel
 * NÃO tem acesso aos módulos de dashboard e de facturação.
 */
export const PAPEIS_GESTOR_ESTOQUE = ['GERENTE', 'GERENTE DE ESTOQUE', 'GESTOR DE ESTOQUE'];

/**
 * Identifica o papel de "gestor de estoque" de forma robusta a variações do
 * nome guardado na base de dados.
 */
export function ehGestorEstoque(roles = []) {
  return (roles || []).some((r) => {
    const role = String(r || '').toUpperCase();
    return role.includes('ESTOQUE') || role === 'GERENTE' || role === 'GESTOR';
  });
}

/**
 * Página inicial segura conforme o papel:
 * - Admin e Contabilista → Dashboard (só o contabilista não tem inventário/facturação)
 * - Gestor de estoque → Inventário (o seu módulo principal)
 * - Operador e restantes → Facturação
 */
export function destinoPadrao(roles = []) {
  const upper = (roles || []).map((r) => String(r || '').toUpperCase());
  if (upper.some((r) => r === 'ADMIN' || r === 'NOVOADMIN' || r === 'CONTABILISTA')) return '/dashboard';
  if (ehGestorEstoque(roles)) return '/inventario';
  return '/faturacao';
}
