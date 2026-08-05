import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { pedidosSuporteApi } from '../api';

const NotificacoesContext = createContext(null);

/**
 * Fornece o contador e a lista de pedidos de suporte não visualizados (admin).
 * Faz polling a cada 15s e também ao reativar a janela/aba. Para utilizadores
 * não administradores mantém sempre o contador a 0.
 */
export function NotificacoesProvider({ children }) {
  const [naoLidos, setNaoLidos] = useState(0);
  const [ultimosPedidos, setUltimosPedidos] = useState([]);

  const atualizar = useCallback(async () => {
    let admin = false;
    try {
      const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
      admin = roles.some((r) => r.toUpperCase() === 'ADMIN' || r.toUpperCase() === 'NOVOADMIN');
    } catch { /* sem papéis guardados */ }

    if (!admin) {
      setNaoLidos(0);
      setUltimosPedidos([]);
      return;
    }

    try {
      const data = await pedidosSuporteApi.naoLidos();
      setNaoLidos(data.total || 0);
      setUltimosPedidos(data.pedidos || []);
    } catch { /* servidor indisponível — mantém o último valor */ }
  }, []);

  useEffect(() => {
    // Atualização inicial adiada para fora do corpo síncrono do efeito
    const inicial = setTimeout(atualizar, 0);
    const intervalo = setInterval(atualizar, 15000);

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
      setUltimosPedidos([]);
    } catch { /* se falhar, o próximo polling volta a buscar */ }
  }, []);

  return (
    <NotificacoesContext.Provider value={{ naoLidos, ultimosPedidos, atualizar, limpar }}>
      {children}
    </NotificacoesContext.Provider>
  );
}

// Mesmo padrão do MenuContext: provider + hook no mesmo ficheiro.
// eslint-disable-next-line react-refresh/only-export-components
export function useNotificacoes() {
  return useContext(NotificacoesContext);
}
