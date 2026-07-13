/*Aqui sera montada a pagina relacionada a Gestão de estoque com cadastro de veiculo com e sem busca de dados na base BIN, edição de dados e 
baixa de veiculos*/
import ContainerSecundario from '../../components/container/ContainerSecundario'
import Card from '../../components/card/Card'
import "../../components/card/Card.css"
import "../../assets/css/thead.css";
import "../../assets/css/themify-icons.css"

const GestaoEstoque = () => {
    return (
        <ContainerSecundario>

            <div className='container d-flex flex-column ' id="path" >
                <div className="d-flex align-items-start ">
                    <div className="p-2">
                        <a className="link_a" href="/home">Gestão</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <p className='atual'>Gestão de Estoque </p>
                    </div>
                </div>
            </div>
            <div className="container d-flex justify-content-center card-container">
                <div className="row justify-content-center  w-100">
                    <div className="card col-md-4 " id="bloco" >
                        <Card classBody={"card_home"} classLink={"/cadastro_veiculo_bin"} classNameIcon={"ti ti-check-box card-ti"} classFooter={"nome_footer"}
                            text_title={"CADASTRAR VEÍCULO"}
                            text_footer={<> Cadastrar um veiculo<br /> buscando dados na Base BIN do Detran </>} />
                    </div>
                    <div className="card col-md-4" id="bloco"  >
                        <Card classBody={"card_home"} classLink={"/relatorio_estoque"} classNameIcon={"ti ti-write card-ti"} classFooter={"nome_footer"} text_title={"CONSULTAR ESTOQUE"}
                            text_footer={"Consultar o estoque de veículos das lojas"} />
                    </div>
                    <div className="card col-md-4" id="bloco"  >
                        <Card classBody={"card_home"} classLink={"/editar_dado"} classNameIcon={"ti ti-pencil-alt card-ti"} classFooter={"nome_footer"} text_title={"EDITAR DADOS"}
                            text_footer={<>Editar dados de um veículo</>} />
                    </div>

                </div>
            </div>
            <div className="container d-flex justify-content-center card-container">
                <div className="row justify-content-center  w-100">

                </div>
            </div>
        </ContainerSecundario>
    )
}

export default GestaoEstoque
