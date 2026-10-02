import ContainerSecundario from '../../components/container/ContainerSecundario'
import Card from '../../components/card/Card'
import "../../components/card/Card.css"
import "../../assets/css/thead.css";
import "../../assets/css/themify-icons.css"


const Lojista = () => {
  return (
    <ContainerSecundario>
      <div className='container d-flex ' id="path" >
        <div className="d-flex align-items-start ">
          <div className="p-2">
            <a className="link_a" href="/home">Gestão</a>
          </div>
          <div className="p-2">
            <i className=' ti ti-angle-right ' id='card-path' />
          </div>
          <div className="p-2">
            <p className='atual'>Lojista </p>
          </div>
        </div>
      </div>
      <div className='container fliud '>
        <div className="container d-flex justify-content-center card-container ">
          <div className="row justify-content-center  w-100">
            <div className="card col-md-4 " id="bloco" >
              <Card classBody={"card_home"} classLink={"/registrar_venda"} classNameIcon={"ti ti-money card-ti"} classFooter={"nome_footer"} text_title={"REGISTRAR VENDA"}
                text_footer={"Registrar a venda de um veículo"} />
            </div>
            <div className="card col-md-4" id="bloco"  >
              <Card classBody={"card_home"} classLink={"/consultar_venda"} classNameIcon={"ti ti-layout-tab card-ti"} classFooter={"nome_footer"} text_title={"CONSULTAR VENDA"}
                text_footer={"Consultar a venda de um veículo"} />
            </div>
            <div className="card col-md-4" id="bloco"  >
              <Card classBody={"card_home"} classLink={"/cadastrar_vendedor"} classNameIcon={"ti ti-user card-ti"} classFooter={"nome_footer"} text_title={"CADASTRAR VENDEDOR"}
                text_footer={"Cadastrar um vendedor da loja"} />
            </div>
          </div>
        </div>
        <div className="container d-flex justify-content-center card-container-2">
          <div className="row justify-content-center  w-100">
            <div className="card col-md-4 " id="bloco" >
              <Card classBody={"card_home"} classLink={"/solicitar_liberacao"} classNameIcon={"ti ti-new-window card-ti"} classFooter={"nome_footer"} text_title={"SOLICITAR LIBERAÇÃO"}
                text_footer={"Solicitar a liberação de um veículo"} />
            </div>
            <div className="card col-md-4" id="bloco"  >
              <Card classBody={"card_home"} classLink={"/relatorio_venda"} classNameIcon={"ti ti-receipt card-ti"} classFooter={"nome_footer"} text_title={"RELATÓRIO DE VENDAS"}
                text_footer={"Gerar um relatório de vendas"} />
            </div>
            <div className="card col-md-4" id="bloco"  >
              <Card classBody={"card_home"} classLink={"/estoque_lojista"} classNameIcon={"ti ti-write card-ti"} classFooter={"nome_footer"} text_title={"ESTOQUE"}
                text_footer={"Consultar o estoque de veículos da loja"} />
            </div>
          </div>
        </div>
        <div className="container d-flex justify-content-center card-container-2">
          <div className="row justify-content-center  w-100">
                      <div className="card col-md-4 " id="bloco" >
            <Card classBody={"card_home"} classLink={"/cadastro_veiculo_lojista"} classNameIcon={"ti ti-check-box card-ti"} classFooter={"nome_footer"}
              text_title={"CADASTRAR VEÍCULO"}
              text_footer={<> Cadastrar um veiculo<br /> buscando dados na Base BIN do Detran </>} />
          </div>
          <div className="card col-md-4 " id="bloco" >
            <Card classBody={"card_home"} classLink={"/devolucao_transferencia"} classNameIcon={"ti ti-share card-ti"} classFooter={"nome_footer"}
              text_title={"DEVOLUÇÃO OU TRANSFERÊNCIA"}
              text_footer={<> Registrar uma devolução<br /> ou transferencia de um veiculo </>} />
          </div>
          </div>

        </div>
      </div>

    </ContainerSecundario>

  )
}

export default Lojista

/*
Criar as seguintes paginas:
ELEMENT = "/path"
RegistrarVenda = "/registrar_venda"
ConsultarVenda = "/consultar_venda"
CadastrarVendedor = "/cadastrar_vendedor"
LiberarVeiculo = "/liberacao_venda"
RelatorioVenda = "/relatorio_venda"
RelatorioEstoque = "/relatorio_estoque"


*/
