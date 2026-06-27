import React from "react"
import {Routes, Route, BrowserRouter} from "react-router-dom"
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
import CadastroTeste from "./Cadastro_Login/Cadastro"
import Cadastro from "./Cadastro_Login/Cadastro"
import PapeisPermissoes from "./pages/PapeisPermissoes"
import GestaoDeUsuarios from "./pages/GestaoDeUsuarios"
import CriarUsuarios from "./components/CriarUsuarios"
import CriarPapel from "./components/CriarPapel"
import ResumoEmpresa from "./pages/ResumoEmpresa"
import Categorias from "./pages/Categorias"
import Auditoria from "./pages/Auditoria"
import { MenuProvider } from "./context/MenuContext"

function App() {
 
  return (
    <div style={{ background: "#F4F7F9", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <MenuProvider>
        <BrowserRouter>
          <Routes>
            <Route  path="/"  element = {<Login />}></Route>
            <Route  path="/cadastro"  element = {<Cadastro />}></Route>
            <Route  path="/dashboard"  element = {<Dashboard />}></Route>
            <Route  path="/faturacao" element = {<Faturacao />}></Route>
            <Route  path="/inventario" element = {<Inventário />}></Route>
            <Route  path="/clientes" element = {<Clientes />}></Route>
            <Route  path="/fornecedores" element = {<Fornecedores />}></Route>
            <Route  path="/ficheiro" element = {<Ficheiro/>}></Route>
            <Route  path="/relatorio" element = {<Relatorio />}></Route>
            <Route  path="/configuracoes" element = {<Configuracoes />}></Route>
             <Route  path="/gestaoUsuarios" element = {<GestaoDeUsuarios />} />
             <Route  path="/permissoes" element = {<PapeisPermissoes />} />
            <Route  path="/venda" element = {<Vendas />} />
            <Route  path="/novoFornecedor" element = {<NovoFornecedor/>}></Route>
            <Route  path="/novoCliente" element = {<NovoCliente />}></Route>
             <Route  path="/novoArtigo" element = {<NovoArtigo />}></Route>
             <Route  path="/novoUsuario" element = {<CriarUsuarios />}></Route>
             <Route  path="/novoPapel" element = {<CriarPapel />}></Route>
             <Route  path="/resumo-empresa" element = {<ResumoEmpresa />}></Route>
             <Route  path="/categorias" element = {<Categorias />}></Route>
             <Route  path="/auditoria" element = {<Auditoria />}></Route>
          </Routes>
        </BrowserRouter>
      </MenuProvider>
    </div>
  )
}

export default App
