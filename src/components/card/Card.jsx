import "../card/Card.css"

function Card({ classLink, classNameIcon, classBody, text_title, text_footer }) {
    return (
        
        <a href={classLink} className="text-decoration-none">
            <div className={classBody}>
                <div className="card_style">
                    <div className={classNameIcon}></div>
                    <div className="nome_card"><span>{text_title}</span></div>
                    <div className="nome_footer">{text_footer}</div>
                </div>
            </div>
        </a>
    )
}
export default Card

/*          <div className="container d-flex justify-content-center card-container">
            <div className="row justify-content-center  w-100">
              <div className="card col-md-4 " id="bloco" >
                <Card classBody={"card_home"} classLink={"/lojista"} classNameIcon={"ti ti-money card-ti"} classFooter={"nome_footer"} text={"LOJISTA"} />
              </div>
              <div className="card col-md-4" id="bloco"  >
                <Card classBody={"card_home"} classLink={"/gestao_estoque"} classNameIcon={"ti ti-briefcase card-ti"} classFooter={"nome_footer"} text={"GESTÃO DE ESTOQUE"} />
              </div>
              <div className="card col-md-4" id="bloco"  >
                <Card classBody={"card_home"} classLink={"/administracao"} classNameIcon={"ti ti-write card-ti"} classFooter={"nome_footer"} text={"ADMINISTRAÇÃO"} />
              </div>
            </div>
          </div> */