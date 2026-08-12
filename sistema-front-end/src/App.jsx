import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, BrowserRouter, useNavigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import PageSkeleton from "./components/PageSkeleton";
import { MenuProvider } from "./context/MenuContext";
import { NotificacoesProvider } from "./context/NotificacoesContext";

// Carregamento sob demanda (React.lazy): cada página só é descarregada quando é
// aberta pela primeira vez. Isto reduz o bundle inicial e acelera o arranque.
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Faturacao = lazy(() => import("./pages/Faturacao"));
const Inventario = lazy(() => import("./pages/Inventario"));
const Clientes = lazy(() => import("./pages/Clientes"));
const Fornecedores = lazy(() => import("./pages/Fornecedores"));
const Ficheiro = lazy(() => import("./pages/Ficheiro"));
const Relatorio = lazy(() => import("./pages/Relatorio"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const NovoFornecedor = lazy(() => import("./components/NovoFornecedor"));
const NovoCliente = lazy(() => import("./components/NovoCliente"));
const Vendas = lazy(() => import("./components/Vendas"));
const NovoArtigo = lazy(() => import("./components/NovoArtigo"));
const Login = lazy(() => import("./Cadastro_Login/Login"));
const Cadastro = lazy(() => import("./Cadastro_Login/Cadastro"));
const PapeisPermissoes = lazy(() => import("./pages/PapeisPermissoes"));
const GestaoDeUsuarios = lazy(() => import("./pages/GestaoDeUsuarios"));
const CriarUsuarios = lazy(() => import("./components/CriarUsuarios"));
const CriarPapel = lazy(() => import("./components/CriarPapel"));
const ResumoEmpresa = lazy(() => import("./pages/ResumoEmpresa"));
const Categorias = lazy(() => import("./pages/Categorias"));
const Auditoria = lazy(() => import("./pages/Auditoria"));
const AlterarPassword = lazy(() => import("./pages/AlterarPassword"));
const PedidoSuporte = lazy(() => import("./pages/PedidoSuporte"));
const GestaoSuporte = lazy(() => import("./pages/GestaoSuporte"));
const InteligenciaFiscal = lazy(() => import("./pages/InteligenciaFiscal"));
const PrevisaoStock = lazy(() => import("./pages/PrevisaoStock"));

/**
 * Ouvinte interno (SPA): quando a API devolve 401 e a sessão é limpa, navega
 * para o login SEM recarregar a página (redirecionamento suave).
 */
function RedirectParaLogin() {
  const navigate = useNavigate();
  useEffect(() => {
    const redirecionar = () => navigate("/", { replace: true });
    window.addEventListener("auth:sessao-expirada", redirecionar);
    return () => window.removeEventListener("auth:sessao-expirada", redirecionar);
  }, [navigate]);
  return null;
}

function App() {
  return (
    <div style={{ background: "#F4F7F9", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MenuProvider>
        <NotificacoesProvider>
          <BrowserRouter>
            <RedirectParaLogin />
            <Suspense fallback={<PageSkeleton />}>
              <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/cadastro" element={<Cadastro />} />
                <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
                <Route path="/faturacao" element={<PrivateRoute><Faturacao /></PrivateRoute>} />
                <Route path="/inventario" element={<PrivateRoute><Inventario /></PrivateRoute>} />
                <Route path="/clientes" element={<PrivateRoute><Clientes /></PrivateRoute>} />
                <Route path="/fornecedores" element={<PrivateRoute><Fornecedores /></PrivateRoute>} />
                <Route path="/ficheiro" element={<PrivateRoute><Ficheiro /></PrivateRoute>} />
                <Route path="/relatorio" element={<PrivateRoute><Relatorio /></PrivateRoute>} />
                <Route path="/configuracoes" element={<PrivateRoute><Configuracoes /></PrivateRoute>} />
                <Route path="/gestaoUsuarios" element={<PrivateRoute><GestaoDeUsuarios /></PrivateRoute>} />
                <Route path="/permissoes" element={<PrivateRoute><PapeisPermissoes /></PrivateRoute>} />
                <Route path="/venda" element={<PrivateRoute><Vendas /></PrivateRoute>} />
                <Route path="/novoFornecedor" element={<PrivateRoute><NovoFornecedor /></PrivateRoute>} />
                <Route path="/novoCliente" element={<PrivateRoute><NovoCliente /></PrivateRoute>} />
                <Route path="/novoArtigo" element={<PrivateRoute><NovoArtigo /></PrivateRoute>} />
                <Route path="/novoUsuario" element={<PrivateRoute><CriarUsuarios /></PrivateRoute>} />
                <Route path="/novoPapel" element={<PrivateRoute><CriarPapel /></PrivateRoute>} />
                <Route path="/resumo-empresa" element={<PrivateRoute><ResumoEmpresa /></PrivateRoute>} />
                <Route path="/categorias" element={<PrivateRoute><Categorias /></PrivateRoute>} />
                <Route path="/auditoria" element={<PrivateRoute><Auditoria /></PrivateRoute>} />
                <Route path="/alterar-password" element={<PrivateRoute><AlterarPassword /></PrivateRoute>} />
                <Route path="/suporte" element={<PrivateRoute><PedidoSuporte /></PrivateRoute>} />
                <Route path="/gestaoSuporte" element={<PrivateRoute><GestaoSuporte /></PrivateRoute>} />
                <Route path="/inteligencia-fiscal" element={<PrivateRoute><InteligenciaFiscal /></PrivateRoute>} />
                <Route path="/previsao-stock" element={<PrivateRoute><PrevisaoStock /></PrivateRoute>} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </NotificacoesProvider>
      </MenuProvider>
    </div>
  );
}

export default App;
