import { useEffect, useRef, /*useState*/ } from "react";
import "../../assets/css/themify-icons.css"
import './Sidebar.css';
import ButtonSidebar from "../button_sidebar/ButtonSidebar";
import Dropdown from "../dropdown/Dropdown";




function Sidebar() {

  /*const [clickedCredito, setClickedCredito] = useState(false);
  const [clickedVeiculo, setClickedVeiculo] = useState(false);*/

  // Refs para os elementos de crédito e veículo
  // Isso é necessário para verificar se o clique foi fora desses elementos
  const creditoRef = useRef(null);
  const veiculoRef = useRef(null);


  /*const handleClickCredito = (e) => {
    e.preventDefault();
    setClickedCredito(true);

  };

  const handleClickVeiculo = (e) => {
    e.preventDefault();
    setClickedVeiculo(true);
  };*/

  // Efeito para adicionar e remover o evento de clique fora dos elementos
  // Isso é necessário para fechar os menus quando o usuário clica fora deles
  useEffect(() => {

    const handleClickOutside = (event) => {
      if (
        creditoRef.current &&
        !creditoRef.current.contains(event.target) &&
        veiculoRef.current &&
        !veiculoRef.current.contains(event.target)
      ) {
        //setClickedCredito(false);
        //setClickedVeiculo(false);
      }
    }
    window.addEventListener('click', handleClickOutside);
    return () => {
      window.removeEventListener('click', handleClickOutside);
    }
  }, []);

  return (

    <div className="corpo_menu">
      <div className="logo_img">
        <img src="https://ambteste.credtudo.com.br/adm/sistema/logoClientes/2849/KoKJAxPldsG9ho7.jpeg" alt="Logo" />
      </div>
      <div >
        <li className="separator">
          <span>EXPLORE</span>
        </li>
        <div className="menu">
          <li className="botoes">
            <ButtonSidebar iconClass={"ti ti-stats-up "} classNameLink={"item_menu"} text={"Dashboard"} href={"#"} />
          </li>
          <li className="botoes" >
            <ButtonSidebar iconClass={"ti ti-time"} classNameLink={"item_menu"} text={"Atividades Recentes"} href={"#"} />
          </li>
          <li className="botoes">
            <ButtonSidebar iconClass={"ti ti-panel"} classNameLink={"item_menu"} text={"Administrativo"} href={"#"} />
          </li>
          <li className="botoes">
            <ButtonSidebar iconClass={"ti ti-calendar"} classNameLink={"item_menu"} text={"Agendamento/OS"} href={"#"} />
          </li>
          <li className="botoes">
            <ButtonSidebar iconClass={"ti ti-time"} classNameLink={"item_menu"} text={"Gestao de Vistorias"} href={"#"} />
          </li>
          <li className="botoes">
            <ButtonSidebar iconClass={"ti ti-time"} classNameLink={"item_menu"} text={"Dashboard"} href={"#"} />
          </li>
          <li className="botoes">
            <ButtonSidebar iconClass={"ti ti-time"} classNameLink={"item_menu"} text={"Dashboard"} href={"#"} />
          </li>
          <li className="separator"><span>CONSULTE</span></li>
          <li className="botoes">
            <Dropdown label={"Crédito"} classNameDrop={"dropdown"} iconClass={"ti ti-wallet"}>
              <li className="botoes">
                <ButtonSidebar classNameLink={"item_menu"} text={"114 - NOVA LOCALIZA VEICULOS"} href={"#"} />
              </li>
              <li className="botoes">
                <ButtonSidebar iconClass={"ti ti-time"} classNameLink={"item_menu"} text={"Dashboard"} href={"#"} />
              </li>
            </Dropdown>
          </li>
          <li className="botoes">
            <Dropdown label={"Crédito"} classNameDrop={"dropdown"} iconClass={"ti ti-wallet"}>
              <li className="botoes">
                <ButtonSidebar iconClass={"ti ti-time"} classNameLink={"item_menu"} text={"Dashboard"} href={"#"} />
              </li>
              <li className="botoes">
                <ButtonSidebar iconClass={"ti ti-time"} classNameLink={"item_menu"} text={"Dashboard"} href={"#"} />
              </li>
            </Dropdown>
            <li className="botoes">
              <ButtonSidebar iconClass={"ti ti-time"} classNameLink={"item_menu"} text={"Dashboard"} href={"#"} />
            </li>
          </li>
        </div>
      </div>
    </div>





  );
}
export default Sidebar;