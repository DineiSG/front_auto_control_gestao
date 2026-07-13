//importações React
import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

//Importação de estilos
import "../../assets/css/thead.css";
import "../../assets/css/themify-icons.css"
import "./Body.css"

//Importação de componentes

import ContainerPrincipal from "../../components/container/ContainerPrincipal";
import ContainerSecundario from "../../components/container/ContainerSecundario";
import Sidebar from "../../components/sidebar/Sidebar";

//Importação de páginas
import RegistrarVenda from "../lojista/vendas/RegistrarVenda"
import Home from "../home/Home";
import Lojista from "../lojista/Lojista"
import GestaoEstoque from "../estoque/GestaoEstoque";
import Administracao from "../administracao/Administracao"
import LiberarVeiculo from "../administracao/movimentacoes/LiberarVeiculo";
import BaixarVeiculo from "../administracao/movimentacoes/BaixarVeiculo";
import HistoricoVeiculo from "../administracao/historico/HistoricoVeiculo";
import RelatoriosMovimentacao from "../administracao/movimentacoes/RelatoriosMovimentacao";
import RelatorioEstoque from "../estoque/gestao/RelatorioEstoque";
import CadastroVeiculoBIN from "../estoque/gestao/CadastroVeiculoBIN";
import CadastroVeiculo from "../estoque/gestao/CadastroVeiculo";
import EditarDado from "../estoque/gestao/EditarDado";
import ConsultarVenda from "../lojista/vendas/ConsultarVenda";
import SolicitarLiberacao from "../lojista/movimentacoes/SolicitarLiberacao";
import CadastrarVendedor from "../lojista/vendas/CadastrarVendedor";
import Dashboard from "../administracao/dashboard/Dashboard";
import HistoricoAcessos from "../administracao/historico/HistoricoAcessos";
import ModalCam from "../../components/modal/ModalCam";
import CadastroLoja from "../administracao/lojista/CadastroLoja";
import Contrato from "../lojista/vendas/contrato/Contrato";
import CadastroFinanceira from "../administracao/lojista/CadastroFinanceira";
import Login from "../home/Login";
import CriarUsuario from "../administracao/usuario/CriarUsuario";
import ProtectedRoute from "../../hooks/protectedRoute";
import CadastroVeiculoCompra from "../estoque/gestao/CadastroVeiculoCompra";
import EstoqueLojista from "../lojista/estoque/EstoqueLojista"
import RelatorioVenda from "../lojista/vendas/RelatorioVenda";
import RegistroVenda from "../administracao/venda/RegistroVenda";
import ConsultaVenda from "../administracao/venda/ConsultaVenda";
import VendasLojista from "../administracao/venda/VendasLojista";


function Body() {
  const [showSidebar, setShowSidebar] = useState(true);

  const location = useLocation();

  //Obtendo o usuario autenticado
  const { user } = useAuth()

  const hideNavbarRoutes = ["/", "/contrato"];

  // V3erifica se a rota atual esta na lista de rotas que devem ocultar a navbar
  const shouldHideNavbar = hideNavbarRoutes.includes(location.pathname);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  }

  const hideSidebar = "/"

  const shouldHideSidebar = hideSidebar.includes(location.pathname);


  return (
    <ContainerPrincipal className="container-principal">
      {!shouldHideNavbar && (
        <header className="navbar navbar-expand-lg d-flex align-items-center " id="barra_navegacao">

          <div className="container-fluid">

            {/*Responsável pelo icone que aciona a barra lateral */}
            <button className="navbar-brand icon-bg p-0" onClick={toggleSidebar} >
              <img src="./LogoAutoControl.png" width={90} height={50} alt="" />
            </button>
            <div className="w-100 text-center" style={{ marginTop: "15px", color: "white" }} >
              {/*Alterando para exibir apenas o primeiro nome do usuario.*/}
              <p>Bem Vindo(a), {user?.nome.split('.')[0] || 'Usuário'}</p>
            </div>

          </div >

          <ModalCam />
        </header>
      )}
      <div className="menu_container">

        {showSidebar && (
          !shouldHideSidebar && (< Sidebar id="sidebar"></Sidebar>)
        )}

        <ContainerSecundario >
          <Routes>
            <Route path="/" hideSidebar={hideSidebar} element={<Login />} />

            <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />

            {/* Modulo Lojista */}
            <Route path="/lojista" element={<ProtectedRoute><Lojista /></ProtectedRoute>} />
            <Route path="/registrar_venda" element={<ProtectedRoute><RegistrarVenda /></ProtectedRoute>} />
            <Route path="/cadastrar_vendedor" element={<ProtectedRoute><CadastrarVendedor /></ProtectedRoute>} />
            <Route path="/solicitar_liberacao" element={<ProtectedRoute><SolicitarLiberacao /></ProtectedRoute>} />
            <Route path="/consultar_venda" element={<ProtectedRoute><ConsultarVenda /></ProtectedRoute>} />
            <Route path="/estoque_lojista" element={<ProtectedRoute><EstoqueLojista /></ProtectedRoute>} />
            <Route path="/relatorio_venda" element={<ProtectedRoute><RelatorioVenda /></ProtectedRoute>} />

            {/* Modulo Administração */}
            <Route path="/administracao" element={<ProtectedRoute><Administracao /></ProtectedRoute>} />
            <Route path="/cadastrar_loja" element={<ProtectedRoute><CadastroLoja /></ProtectedRoute>} />
            <Route path="/liberar_veiculo" element={<ProtectedRoute><LiberarVeiculo /></ProtectedRoute>} />
            <Route path="/baixar_veiculo" element={<ProtectedRoute><BaixarVeiculo /></ProtectedRoute>} />
            <Route path="/relatorios_movimentacao" element={<ProtectedRoute><RelatoriosMovimentacao /></ProtectedRoute>} />
            <Route path="/historico" element={<ProtectedRoute><HistoricoVeiculo /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/historico_acessos" element={<ProtectedRoute><HistoricoAcessos /></ProtectedRoute>} />
            <Route path="/contrato" element={<ProtectedRoute><Contrato /></ProtectedRoute>} />
            <Route path="/cadastro_financeira" element={<ProtectedRoute><CadastroFinanceira /></ProtectedRoute>} />
            <Route path="/cadastro_usuarios" element={<ProtectedRoute><CriarUsuario /></ProtectedRoute>} />
            <Route path="/cadastro_veiculo_compra" element={<ProtectedRoute><CadastroVeiculoCompra /></ProtectedRoute>} />
            <Route path="/registro_venda" element={<ProtectedRoute><RegistroVenda /></ProtectedRoute>} />
            <Route path="/consulta_venda" element={<ProtectedRoute><ConsultaVenda /></ProtectedRoute>} />
            <Route path="/vendas_lojista" element={<ProtectedRoute><VendasLojista /></ProtectedRoute>} />

            {/* Modulo Gestão de Estoque */}
            <Route path="/gestao_estoque" element={<ProtectedRoute><GestaoEstoque /></ProtectedRoute>} />
            <Route path="/relatorio_estoque" element={<ProtectedRoute><RelatorioEstoque /></ProtectedRoute>} />
            <Route path="/cadastro_veiculo" element={<ProtectedRoute><CadastroVeiculo /></ProtectedRoute>} />
            <Route path="/cadastro_veiculo_bin" element={<ProtectedRoute><CadastroVeiculoBIN /></ProtectedRoute>} />
            <Route path="/editar_dado" element={<ProtectedRoute><EditarDado /></ProtectedRoute>} />

            {/* Adicione outras rotas conforme necessário */}
          </Routes>

        </ContainerSecundario>
        <footer className="footer"></footer>
      </div>
    </ContainerPrincipal >

  );
}
export default Body;