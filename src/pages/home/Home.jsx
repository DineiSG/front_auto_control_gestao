import Card from "../../components/card/Card"
import ContainerSecundario from "../../components/container/ContainerSecundario"
import { useAuth } from "../../hooks/useAuth"

const Home = () => {

    const { user } = useAuth()

    console.log("USER:", user);

    const cards = [
        {
            title: "LOJISTA",
            link: "/lojista",
            icon: "ti ti-money card-ti",
            roles: ["SUPORTE", "LOJISTA"]
        },
        {
            title: "GESTÃO DE ESTOQUE",
            link: "/gestao_estoque",
            icon: "ti ti-briefcase card-ti",
            roles: ["ADMINISTRADOR", "SUPORTE", "COLABORADOR"]
        },
        {
            title: "ADMINISTRAÇÃO",
            link: "/administracao",
            icon: "ti ti-write card-ti",
            roles: ["SUPORTE", "ADMINISTRADOR"]
        }
    ];

    return (
        <ContainerSecundario>
            <div className='container d-flex'>
                <div className='container d-flex flex-column ' id="path" >
                    <div className="d-flex align-items-start ">
                        <div className="p-2">
                            <a className="link_a" href="/">Logout</a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="container d-flex justify-content-center card-container">

                <div className="row justify-content-center w-100">
                    {cards
                        .filter(card => card.roles.includes(user?.role))
                        .map((card, index) => (
                            <div className="card col-md-4" id="bloco" key={index}>
                                <Card
                                    classBody="card_home"
                                    classLink={card.link}
                                    classNameIcon={card.icon}
                                    classFooter="nome_footer"
                                    text_title={card.title}
                                />
                            </div>
                        ))}
                </div>
            </div>
        </ContainerSecundario>
    )
}

export default Home
