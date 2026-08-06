import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pedidosSuporteApi } from '../api';
import { obterRoles } from '../utils/authStorage';

const NotificacoesContext = createContext(null);

const INTERVALO_POLLING_MS = 30000; // 30s (15s → 30s para reduzir carga)

/**
 * Fornece o contador e a lista de pedidos de suporte não visualizados (admin).
 * Faz polling a cada 30s e também ao reativar a janela/aba. Para utilizadores
 * não administradores mantém sempre o contador a 0.
 *
 * Otimizações de performance:
 * - O valor do contexto só muda quando o contador/lista realmente mudam, evitando
 *   re-renderizações desnecessárias do SideBar/NavBar a cada polling.
 * - Não são criados novos arrays no estado quando não há alterações (React
 *   compararia referências diferentes e re-renderizaria todos os consumidores).
 */
export function NotificacoesProvider({ children }) {
  const [naoLidos, setNaoLidos] = useState(0);
  const [ultimosPedidos, setUltimosPedidos] = useState([]);

  // Evita atualizar o estado com a mesma lista em cada polling
  const atualizarPedidos = useCallback((pedidos) => {
    setUltimosPedidos((prev) => {
      // Compara primeiro e último item (a lista é ordenada por data, novas
      // ocorrências aparecem no topo) para detetar mudanças sem re-render.
      const mesmoConteudo =
        prev.length === pedidos.length &&
        prev[0]?.id === pedidos[0]?.id &&
        prev[prev.length - 1]?.id === pedidos[pedidos.length - 1]?.id;
      if (mesmoConteudo) {
        return prev; // nada mudou — mantém a referência para evitar re-render
      }
      return pedidos;
    });
  }, []);

  const atualizar = useCallback(async () => {
    let admin = false;
    try {
      admin = obterRoles().some((r) => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'NOVOADMIN');
    } catch { /* sem papéis guardados */ }

    if (!admin) {
      setNaoLidos(0);
      atualizarPedidos([]);
      return;
    }

    try {
      const data = await pedidosSuporteApi.naoLidos();
      setNaoLidos(data.total || 0);
      atualizarPedidos(data.pedidos || []);
    } catch { /* servidor indisponível — mantém o último valor */ }
  }, [atualizarPedidos]);

  useEffect(() => {
    // Atualização inicial adiada para fora do corpo síncrono do efeito
    const inicial = setTimeout(atualizar, 0);
    const intervalo = setInterval(atualizar, INTERVALO_POLLING_MS);

    const aoFocar = () => atualizar();
    const aoVisibilidade = () => {
      if (!document.hidden) atualizar();
    };
    window.addEventListener('focus', aoFocar);
    document.addEventListener('visibilitychange', aoVisibilidade);

    return () => {
      clearTimeout(inicial);
      clearInterval(intervalo);
      window.removeEventListener('focus', aoFocar);
      document.removeEventListener('visibilitychange', aoVisibilidade);
    };
  }, [atualizar]);

  /** Marca todos como visualizados (chamado quando o admin abre a gestão). */
  const limpar = useCallback(async () => {
    try {
      await pedidosSuporteApi.marcarVistos();
      setNaoLidos(0);
      atualizarPedidos([]);
    } catch { /* se falhar, o próximo polling volta a buscar */ }
  }, [atualizarPedidos]);

  // O valor só muda quando os dados realmente mudam → consumidores (SideBar, NavBar)
  // não re-renderizam em cada polling sem necessidade.
  const value = useMemo(
    () => ({ naoLidos, ultimosPedidos, atualizar, limpar }),
    [naoLidos, ultimosPedidos, atualizar, limpar]
  );

  return (
    <NotificacoesContext.Provider value={value}>
      {children}
    </NotificacoesContext.Provider>
  );
}

// Mesmo padrão do MenuContext: provider + hook no mesmo ficheiro.
// eslint-disable-next-line react-refresh/only-export-components
export function useNotificacoes() {
  return useContext(NotificacoesContext);
}
