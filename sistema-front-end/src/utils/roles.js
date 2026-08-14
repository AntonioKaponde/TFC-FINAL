/**
 * O papel de gestor chama-se "Gerente" em todo o sistema (as empresas novas
 * são criadas com esse nome e as empresas antigas são migradas no arranque do
 * backend). As variantes antigas mantêm-se aqui apenas como defesa para
 * sessões abertas antes da migração. Este papel NÃO tem acesso aos módulos de
 * dashboard, facturação e clientes.
 */
export const PAPEIS_GESTOR_ESTOQUE = ['GERENTE', 'GERENTE DE ESTOQUE', 'GESTOR DE ESTOQUE'];

/**
 * Identifica o papel de "Gerente" de forma robusta, incluindo variantes
 * antigas do nome guardadas na base de dados ou em sessões já abertas.
 */
export function ehGestorEstoque(roles = []) {
  return (roles || []).some((r) => {
    const role = String(r || '').toUpperCase();
    return role.includes('ESTOQUE') || role === 'GERENTE' || role === 'GESTOR';
  });
}

/**
 * Página inicial segura conforme o papel:
 * - Admin e Contabilista → Dashboard
 * - Gerente → Inventário (o seu módulo principal)
 * - Operador e restantes → Facturação
 */
export function destinoPadrao(roles = []) {
  const upper = (roles || []).map((r) => String(r || '').toUpperCase());
  if (upper.some((r) => r === 'ADMIN' || r === 'NOVOADMIN' || r === 'CONTABILISTA')) return '/dashboard';
  if (ehGestorEstoque(roles)) return '/inventario';
  return '/faturacao';
}
