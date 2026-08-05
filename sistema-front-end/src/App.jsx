import React from "react"
import {Routes, Route, BrowserRouter} from "react-router-dom"
import PrivateRoute from "./components/PrivateRoute"
import Dashboard from "./pages/Dashboard"
import Faturacao from "./pages/Faturacao"
import Inventário from "./pages/Inventario"
import Clientes from "./pages/Clientes"
import Fornecedores from "./pages/Fornecedores"
import Ficheiro from "./pages/Ficheiro"
import Relatorio from "./pages/Relatorio"
import Configuracoes from "./pages/Configuracoes"
import NovoFornecedor from "./components/NovoFornecedor"
import NovoCliente from "./components/NovoCliente"
import Vendas from "./components/Vendas"
import NovoArtigo from "./components/NovoArtigo"
import Login from "./Cadastro_Login/Login"
import Cadastro from "./Cadastro_Login/Cadastro"
import PapeisPermissoes from "./pages/PapeisPermissoes"
import GestaoDeUsuarios from "./pages/GestaoDeUsuarios"
import CriarUsuarios from "./components/CriarUsuarios"
import CriarPapel from "./components/CriarPapel"
import ResumoEmpresa from "./pages/ResumoEmpresa"
import Categorias from "./pages/Categorias"
import Auditoria from "./pages/Auditoria"
import AlterarPassword from "./pages/AlterarPassword"
import PedidoSuporte from "./pages/PedidoSuporte"
import GestaoSuporte from "./pages/GestaoSuporte"
import InteligenciaFiscal from "./pages/InteligenciaFiscal"
import PrevisaoStock from "./pages/PrevisaoStock"
import { MenuProvider } from "./context/MenuContext"
import { NotificacoesProvider } from "./context/NotificacoesContext"

function App() {
 
  return (
    <div style={{ background: "#F4F7F9", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MenuProvider>
        <NotificacoesProvider>
        <BrowserRouter>
          <Routes>
            <Route  path="/"  element = {<Login />}></Route>
            <Route  path="/cadastro"  element = {<Cadastro />}></Route>
            <Route  path="/dashboard"  element = {<PrivateRoute><Dashboard /></PrivateRoute>}></Route>
            <Route  path="/faturacao" element = {<PrivateRoute><Faturacao /></PrivateRoute>}></Route>
            <Route  path="/inventario" element = {<PrivateRoute><Inventário /></PrivateRoute>}></Route>
            <Route  path="/clientes" element = {<PrivateRoute><Clientes /></PrivateRoute>}></Route>
            <Route  path="/fornecedores" element = {<PrivateRoute><Fornecedores /></PrivateRoute>}></Route>
            <Route  path="/ficheiro" element = {<PrivateRoute><Ficheiro/></PrivateRoute>}></Route>
            <Route  path="/relatorio" element = {<PrivateRoute><Relatorio /></PrivateRoute>}></Route>
            <Route  path="/configuracoes" element = {<PrivateRoute><Configuracoes /></PrivateRoute>}></Route>
             <Route  path="/gestaoUsuarios" element = {<PrivateRoute><GestaoDeUsuarios /></PrivateRoute>} />
             <Route  path="/permissoes" element = {<PrivateRoute><PapeisPermissoes /></PrivateRoute>} />
            <Route  path="/venda" element = {<PrivateRoute><Vendas /></PrivateRoute>} />
            <Route  path="/novoFornecedor" element = {<PrivateRoute><NovoFornecedor/></PrivateRoute>}></Route>
            <Route  path="/novoCliente" element = {<PrivateRoute><NovoCliente /></PrivateRoute>}></Route>
             <Route  path="/novoArtigo" element = {<PrivateRoute><NovoArtigo /></PrivateRoute>}></Route>
             <Route  path="/novoUsuario" element = {<PrivateRoute><CriarUsuarios /></PrivateRoute>}></Route>
             <Route  path="/novoPapel" element = {<PrivateRoute><CriarPapel /></PrivateRoute>}></Route>
             <Route  path="/resumo-empresa" element = {<PrivateRoute><ResumoEmpresa /></PrivateRoute>}></Route>
             <Route  path="/categorias" element = {<PrivateRoute><Categorias /></PrivateRoute>}></Route>
             <Route  path="/auditoria" element = {<PrivateRoute><Auditoria /></PrivateRoute>}></Route>
             <Route  path="/alterar-password" element = {<PrivateRoute><AlterarPassword /></PrivateRoute>}></Route>
             <Route  path="/suporte" element = {<PrivateRoute><PedidoSuporte /></PrivateRoute>}></Route>
             <Route  path="/gestaoSuporte" element = {<PrivateRoute><GestaoSuporte /></PrivateRoute>}></Route>
             <Route  path="/inteligencia-fiscal" element = {<PrivateRoute><InteligenciaFiscal /></PrivateRoute>}></Route>
             <Route  path="/previsao-stock" element = {<PrivateRoute><PrevisaoStock /></PrivateRoute>}></Route>
          </Routes>
        </BrowserRouter>
        </NotificacoesProvider>
      </MenuProvider>
    </div>
  )
}

export default App
