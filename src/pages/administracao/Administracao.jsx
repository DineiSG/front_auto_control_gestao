import ContainerSecundario from '../../components/container/ContainerSecundario'
import Card from '../../components/card/Card'
import "../../components/card/Card.css"
import "../../assets/css/thead.css";
import "../../assets/css/themify-icons.css"


const Administracao = () => {


    return (
        <div  >
            <ContainerSecundario >
                <div className='container d-flex flex-column ' id="path" >
                    <div className="d-flex align-items-start ">
                        <div className="p-2">
                            <a className="link_a" href="/home">Gestão</a>
                        </div>
                        <div className="p-2">
                            <i className=' ti ti-angle-right ' id='card-path' />
                        </div>
                        <div className="p-2">
                            <p className='atual'>Administracao </p>
                        </div>
                    </div>
                </div>
                <div className="container d-flex justify-content-center card-container">
                    <div className="row justify-content-center  w-100">
                        <div className="card col-md-4 " id="bloco" >
                            <Card classBody={"card_home"} classLink={"/liberar_veiculo"} classNameIcon={"ti ti-new-window card-ti"} classFooter={"nome_footer"} text_title={"LIBERAÇÕES"}
                                text_footer={<> Solicitar liberação de um veículo <br /> Solicitar o cancelamento de uma liberação </>} />
                        </div>
                        <div className="card col-md-4" id="bloco"  >
                            <Card classBody={"card_home"} classLink={"/baixar_veiculo"} classNameIcon={"ti ti-close card-ti"} classFooter={"nome_footer"} text_title={"BAIXAR VEÍCULO"}
                                text_footer={<> Realizar baixa de um <br />veiculo do estoque de uma loja </>} />
                        </div>
                        <div className="card col-md-4" id="bloco"  >
                            <Card classBody={"card_home"} classLink={"/relatorios_movimentacao"} classNameIcon={"ti ti-receipt card-ti"} classFooter={"nome_footer"} text_title={"HISTÓRICO DE BAIXAS / LIBERAÇÕES "}
                                text_footer={<>Gerar relatórios de liberação e baixa de veículos </>} />
                        </div>
                    </div>
                </div>
                <div className="container d-flex justify-content-center card-container">
                    <div className="row justify-content-center  w-100">
                        <div className="card col-md-4" id="bloco"  >
                            <Card classBody={"card_home"} classLink={"/historico"} classNameIcon={"ti ti-car card-ti"} classFooter={"nome_footer"} text_title={"HISTÓRICO DO VEICULO"}
                                text_footer={<>Consultar o historico do veículo</>} />
                        </div>
                        <div className="card col-md-4" id="bloco"  >
                            <Card classBody={"card_home"} classLink={"/historico_acessos"} classNameIcon={"ti ti-exchange-vertical card-ti"} classFooter={"nome_footer"} text_title={"ACESSOS"}
                                text_footer={<>Consultar o historico de entradas<br /> e saidas de um veículo</>} />
                        </div>
                        <div className="card col-md-4" id="bloco"  >
                            <Card classBody={"card_home"} classLink={"/dashboard"} classNameIcon={"ti ti-bar-chart card-ti"} classFooter={"nome_footer"} text_title={"DASHBOARD"}
                                text_footer={<>Estatísticas diversas </>} />
                        </div>
                    </div>
                </div>
                <div className="container d-flex justify-content-center card-container">
                    <div className="row justify-content-center  w-100">
                        <div className="card col-md-4" id="bloco"  >
                            <Card classBody={"card_home"} classLink={"/cadastrar_loja"} classNameIcon={"ti ti-home card-ti"} classFooter={"nome_footer"} text_title={"LOJAS"}
                                text_footer={<>Cadastrar ou editar dados de uma loja</>} />
                        </div>
                        <div className="card col-md-4" id="bloco"  >
                            <Card classBody={"card_home"} classLink={"/cadastro_financeira"} classNameIcon={"ti ti-money card-ti"} classFooter={"nome_footer"} text_title={"BANCOS"}
                                text_footer={<>Cadastrar ou editar dados de um banco </>} />
                        </div>
                        <div className="card col-md-4" id="bloco"  >
                            <Card classBody={"card_home"} classLink={"/cadastro_usuarios"} classNameIcon={"ti ti-user card-ti"} classFooter={"nome_footer"} text_title={"USUÁRIO"}
                                text_footer={<>Cadastrar novo usuario <br />Editar a senha de um usuario </>} />
                        </div>
                    </div>
                </div>
                <div className="container d-flex justify-content-center card-container">
                    <div className="card col-md-4 " id="bloco" >
                        <Card classBody={"card_home"} classLink={"/registro_venda"} classNameIcon={"ti ti-money card-ti"} classFooter={"nome_footer"} text_title={"REGISTRAR VENDA"}
                            text_footer={"Registrar a venda de um veículo"} />
                    </div>
                    <div className="card col-md-4" id="bloco"  >
                        <Card classBody={"card_home"} classLink={"/consulta_venda"} classNameIcon={"ti ti-layout-tab card-ti"} classFooter={"nome_footer"} text_title={"CONSULTAR VENDA"}
                            text_footer={"Consultar a venda de um veículo"} />
                    </div>
                    <div className="card col-md-4" id="bloco"  >
                        <Card classBody={"card_home"} classLink={"/vendas_lojista"} classNameIcon={"ti ti-receipt card-ti"} classFooter={"nome_footer"} text_title={"RELATÓRIO DE VENDAS"}
                            text_footer={"Gerar um relatório de vendas"} />
                    </div>
                </div>
                <div className="container d-flex justify-content-center card-container">
                                        <div className="card col-md-4" id="bloco"  >
                        <Card classBody={"card_home"} classLink={"/cadastro_veiculo_compra"} classNameIcon={"ti ti-car card-ti"} classFooter={"nome_footer"} text_title={"CADASTRO FORPLAN"}
                            text_footer={<>Cadastrar um veiculo adquirido <br /> por meio do Forplan</>} />
                    </div>
                </div>
            </ContainerSecundario>
        </div>
    )
}

export default Administracao
