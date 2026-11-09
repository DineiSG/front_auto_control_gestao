import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import "../../assets/css/themify-icons.css"
import './Sidebar.css';
import ButtonSidebar from "../button_sidebar/ButtonSidebar";
import { useAuth } from "../../hooks/useAuth";




function Sidebar() {

  const { user } = useAuth()


  // Refs para os elementos de crédito e veículo
  // Isso é necessário para verificar se o clique foi fora desses elementos
  const veiculoRef = useRef(null);


  // Efeito para adicionar e remover o evento de clique fora dos elementos
  // Isso é necessário para fechar os menus quando o usuário clica fora deles
  useEffect(() => {

    const handleClickOutside = (event) => {

      veiculoRef.current &&
        !veiculoRef.current.contains(event.target)

    }

    window.addEventListener('click', handleClickOutside);

    return () => {
      window.removeEventListener('click', handleClickOutside);
    }
  }, []);

  return (

    <div className="corpo_menu ">
      <div className="menu">
        <li className="nav-separator" style={{ marginTop: "10px", alignItems: "center", display: "flex", justifyContent: "center" }} >
          <p style={{ color: "white", fontSize: "18px", fontWeight: "500" }}><span>Menu</span></p>
        </li>
        {user?.role === "SUPORTE" && (
          <>
            <li className="botoes" >
              <Link to="/lojista" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-money"} classNameLink={"item_menu"} text={"Lojista"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/administracao" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-write "} classNameLink={"item_menu"} text={"Administraçao"} /></Link>
            </li>
            <li className="botoes" >
              <Link to="/gestao_estoque" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-briefcase"} classNameLink={"item_menu"} text={"Gestao de Estoque"} /></Link>
            </li>
          </>
        )}
        {user?.role === "ADMINISTRADOR" && (
          <>
            <li className="botoes" >
              <Link to="/gestao_estoque" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-briefcase"} classNameLink={"item_menu"} text={"Gestão de Estoque"} /></Link>
            </li>
            <li className="botoes" >
              <Link to="/liberar_veiculo" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-new-window"} classNameLink={"item_menu"} text={"Liberações"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/baixar_veiculo" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-close "} classNameLink={"item_menu"} text={"Baixar Veículo"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/relatorios_movimentacao" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-receipt "} classNameLink={"item_menu"} text={"Histórico Baixas / Liberações"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/historico" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-car "} classNameLink={"item_menu"} text={"Histórico do Veículo"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/historico_acessos" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-exchange-vertical "} classNameLink={"item_menu"} text={"Histórico de Acessos"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/dashboard" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-bar-chart "} classNameLink={"item_menu"} text={"Dashboard"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/cadastrar_loja" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-home "} classNameLink={"item_menu"} text={"Lojas"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/cadastro_usuarios" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-user"} classNameLink={"item_menu"} text={"Gestão de Usuários"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/registro_venda" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-money  "} classNameLink={"item_menu"} text={"Registrar Venda"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/consultar_venda" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-layout-tab "} classNameLink={"item_menu"} text={"Consultar Venda"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/vendas_lojista" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-receipt "} classNameLink={"item_menu"} text={"Relatório de Vendas"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/cadastro_veiculo_compra" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-car "} classNameLink={"item_menu"} text={"Cadastro Forplan"} /></Link>
            </li>

          </>
        )}
        {user?.role === "LOJISTA" && (
          <>
            <li className="botoes">
              <Link to="/registrar_venda" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-money "} classNameLink={"item_menu"} text={"Registrar Venda"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/consultar_venda" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-layout-tab "} classNameLink={"item_menu"} text={"Consultar Venda"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/cadastrar_vendedor" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-user "} classNameLink={"item_menu"} text={"Cadastrar Vendedor"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/devolucao_transferencia" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-share"} classNameLink={"item_menu"} text={"Devolução ou Transferencia"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/solicitar_liberacao" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-new-window "} classNameLink={"item_menu"} text={"Solicitar Liberação"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/relatorio_venda" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-receipt "} classNameLink={"item_menu"} text={"Relatório de Vendas"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/cadastro_veiculo_lojista" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-car "} classNameLink={"item_menu"} text={"Cadastrar Veículo"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/estoque_lojista" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-write "} classNameLink={"item_menu"} text={"Consultar Estoque"} /></Link>
            </li>
          </>
        )}
        {user?.role === "COLABORADOR" && (
          <>
            <li className="botoes">
              <Link to="/cadastro_veiculo_bin" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-check-box "} classNameLink={"item_menu"} text={"Cadastrar Veículo"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/relatorio_estoque" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-write "} classNameLink={"item_menu"} text={"Consultar Estoque"} /></Link>
            </li>
            <li className="botoes">
              <Link to="/editar_dado" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-pencil-alt"} classNameLink={"item_menu"} text={"Editar Dados"} /></Link>
            </li>
          </>
        )}
        <li className="botoes">
          <Link to="/" style={{ textDecoration: "none" }} ><ButtonSidebar iconClass={"ti ti-power-off "} classNameLink={"item_menu"} text={"Sair"} /></Link>
        </li>



      </div>
    </div>





  );
}
export default Sidebar;