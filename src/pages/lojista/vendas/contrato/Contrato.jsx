import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import './Contrato.css'
import ContainerSecundario from '../../../../components/container/ContainerSecundario';
import Box from '../../../../components/box/Box';

const Contrato = () => {


    const [placa, setPlaca] = useState("");
    const [inputValue, setInputValue] = useState("")
    const [dadosVenda, setDadosVenda] = useState({})
    const location = useLocation()
    const placaInicial = location.state?.placa || '';

    const [textoVenda, setTextoVenda] = useState(
        `VENDEDOR:\n Auto Shopping Passeio das Águas, com sede na AV.PERIMETRAL NORTE, Nº 8303, CEP 74593-841 QD ÁREA LOTE B, FAZENDA CRIMEIA CAVEIRAS, GOIÂNIA-GO, CNPJ/MF: 06.171.601/0001-43,
     IE: 10.533.977-6, FONE: (62) 9 8123-0063, E-MAIL adm@autoshoppinggo.com.br .`
    )
    const spanRef = useRef(null)

    useEffect(() => {
        if (placaInicial) {
            setPlaca(placaInicial)
        }
    }, [placaInicial])


    function converterParaMaiusculo(texto) {
        return texto.toUpperCase()
    }


    const buscarDados = async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();

            // sempre trabalhar com a placa atualizada do input
            const textoMaiusculo = converterParaMaiusculo(placa);

            try {
                // --- Buscar dados financeiros ---
                const responseFinanceiro = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/vendas/placa/${textoMaiusculo}`
                );

                if (responseFinanceiro.ok) {
                    const data = await responseFinanceiro.json();

                    setDadosVenda({
                        contrato: data.id,
                        placa: data.placa,
                        tipoVenda: data.tipoVenda,
                        instituicao: data.instituicao,
                        valorVenda: data.valorVenda,
                        valorEntrada: data.valorEntrada,
                        valorFinanciado: data.valorFinanciamento,
                        comprador: data.comprador,
                        nascimento: data.nascimento,
                        rua: data.rua,
                        endereco: data.endereco,
                        cep: data.cep,
                        rg: data.rg,
                        cpf: data.cpf,
                        email: data.email,
                        cidade: data.cidade,
                        telefone: data.telefone,
                        bairro: data.bairro,
                        estado: data.estado,
                        registro: data.dataRegistro,
                        date: data.observacoes,
                    });
                } else {
                    console.log("Erro ao buscar os dados financeiros.");
                }

                // --- Buscar dados do veículo ---
                const response = await fetch(
                    `${import.meta.env.VITE_API_BASE_URL}/veiculos/placa/${textoMaiusculo}`
                );
                if (!response.ok) {
                    window.alert("Dados não encontrados. Verifique a placa e tente novamente.");
                    return;
                }
                const dados = await response.json();

                const placaRetorno = dados.placa || "N/A";
                const marca = dados.marca || "N/A";
                const modelo = dados.modelo || "N/A";
                const cor = dados.cor || "N/A";
                const anoFabricacao = dados.ano || "N/A";
                const anoModelo = dados.ano_modelo || "N/A";
                const renavam = dados.renavan || "N/A";

                const textoConcatenado = `Placa: ${placaRetorno}, Marca: ${marca}, Modelo: ${modelo}, Cor: ${cor}, Ano Fabricação: ${anoFabricacao}, Ano Modelo: ${anoModelo}, Renavam: ${renavam}`;

                setInputValue(textoConcatenado);
            } catch (error) {
                console.error("Erro na consulta: ", error);
                alert("Erro ao buscar os dados do veículo.");
            }
        }
    };

    /*Função que trata do retorno de data */
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <ContainerSecundario >
            <Box id="corpo_contrato" >
                <div className='container-sm' id='printable'>
                    <div className="superior">
                        <p className="num_contrato">CONTRATO:</p>
                        <input className="placa" tyle='text' value={placa}></input>
                        <p className="num_contrato">{formatTimestamp(dadosVenda.registro)}</p>
                        <img src="./aspa.png" width={200} height={100} alt='Auto Shopping' title='Auto Shopping' className="logo" />

                        <div className="qr" >
                            <img src="./QR.jpg" width={115} height={115} alt='Passeio das Aguas' title='Passeio das Aguas' />
                        </div>
                    </div>
                    <div className="corpo_contrato2">
                        <p className="title"> CONTRATO DE VENDA</p>
                        <br />
                        <br />
                        <p className="descricao">PARA PARTICIPAÇÃO NO <strong>"PROGRAMA DE BENEFÍCIOS"</strong> DO PASSEIO DAS ÁGUAS SHOPPING.</p>
                        <div className="body2" onKeyDown={buscarDados}>
                            <div className="containers">
                                <div className="compra2">
                                    <span ref={spanRef} contentEditable suppressContentEditableWarning={true}
                                        style={{ color: 'black', padding: "2px", display: "inline-block", minWidth: "100px", fontSize: '15px' }} >
                                        {`COMPRADOR: ${dadosVenda.comprador}, brasileiro(a), nascido(a) em ${dadosVenda.nascimento}, residente e domicialiado(a) na 
                                        ${dadosVenda.rua}, ${dadosVenda.endereco}, CEP: ${dadosVenda.cep}, Bairro: ${dadosVenda.bairro}, na cidade de ${dadosVenda.cidade}, 
                                        portador(a) do CPF.: ${dadosVenda.cpf} e do RG: ${dadosVenda.rg}, telefone: ${dadosVenda.telefone}, email: ${dadosVenda.email}.`}
                                    </span>
                                </div>
                                <div className="vendedor">
                                    <span value={setTextoVenda} style={{
                                        color: 'black', padding: "2px",
                                        display: "inline-block", minWidth: "100px", fontSize: '15px'
                                    }} >
                                        {textoVenda}
                                    </span>
                                    <br></br>
                                    <div className="objeto" >
                                        <table className="veiculo">
                                            <tr>
                                                <th className="tb_title" >DADOS DO VEÍCULO</th>
                                            </tr>
                                            <tr className="info_venda">
                                                <td><textarea
                                                    className="dados_veiculo"
                                                    name='placa'
                                                    type='text'
                                                    value={inputValue || placa}
                                                    onChange={(e) => {
                                                        // Permite editar o input manualmente e atualizar o valor da placa
                                                        setInputValue(e.target.value);
                                                        setPlaca(e.target.value.split(",")[0].replace("Placa: ", "").trim().toUpperCase()); // Extrai a placa
                                                    }}
                                                    onKeyDown={buscarDados}
                                                    placeholder='Digite a placa e pressione Enter' />
                                                </td>
                                            </tr>
                                        </table>
                                    </div>
                                    <br>
                                    </br>
                                    <div>
                                        <p className="fin_data">DADOS FINANCEIROS</p>
                                        <table className="tabela" >
                                            <thead>
                                                <tr className="dados_venda"  >
                                                    <th className="info_venda">FORMA DE PAGAMENTO</th>
                                                    <th className="info_venda">FINANCEIRA, BANCO OU CONSORCIO</th>
                                                    <th className="info_venda">VALOR DE VENDA </th>
                                                    <th className="info_venda">VALOR DE ENTRADA </th>
                                                    <th className="info_venda">VALOR FINANCIADO </th>
                                                    <th className="info_venda">TOTAL </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="info"><input type='text' className="veic_data" name='negociacao' value={dadosVenda.tipoVenda} readOnly /></td>
                                                    <td className="info"><input type='text' className="veic_data" name='instituicao' value={dadosVenda.instituicao} readOnly /></td>
                                                    <td className="info"><input type='text' className="veic_data" name='venda' value={`R$ ${dadosVenda.valorVenda}`} readOnly /></td>
                                                    <td className="info"><input type='text' className="veic_data" name='entrada' value={`R$ ${dadosVenda.valorEntrada}`} readOnly /></td>
                                                    <td className="info"><input type='text' className="veic_data" name='financiamento' value={`R$ ${dadosVenda.valorFinanciado}.00`} readOnly /></td>
                                                    <td className="info"><input type='text' className="veic_data" name='total' value={`R$ ${dadosVenda.valorVenda}`} readOnly /></td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>

                                </div>
                                <div className="termos">
                                    <h3 className="condicoes_2">TERMO DE PARTICIPAÇÃO</h3>
                                    <h6><strong>Descrição da Promoção:</strong></h6>
                                    <p>Todo cliente que adquirir um veículo em qualquer loja do Auto Shopping Passeio das Águas e realizar o cadastro no
                                        aplicativo oficial do Passeio das Águas Shopping, terá direito a concorrer
                                        <strong style={{color:"red"}}> 2 IPhones 17 de 256 GB de armazenamento</strong>.</p>
                                    <h6><strong>Requisitos para participar</strong></h6>
                                    <ol>
                                        <li>Realizar a compra de um veículo em loja participante do Auto Shopping;</li>
                                        <li>Efetuar cadastro no aplicativo do Passeio das Águas Shopping;</li>
                                        <li>Enviar, por meio do aplicativo, comprovante de compra do veículo;</li>
                                        <li>Cumpridos os requisitos, o benefício será liberado no perfil do cliente cadastrado.</li>
                                    </ol>
                                    <p>Este termo faz parte integrante das Regras Gerais da Promoção e o participante, ao aderir à
                                        campanha, declara ciência e concordância com todos os seus termos e condições.</p>
                                    <p>As partes reconhecem e concordam que este documento é exclusivamente para fins informativos, não constitui
                                        contrato vinculativo, tampouco gera obrigações legais de qualquer natureza, nem configura compromisso, direito ou
                                        obrigação juridicamente exigível por qualquer das partes.</p>
                                    <p>Promoção válida de <strong style={{color:"red"}}>01/06/2026 a 30/06/2026</strong></p>

                                </div>
                                <p className="data_contrato"><strong> {dadosVenda.date}</strong> </p>
                                <div className="assinatura2" >
                                    <input className="linha2" ></input>
                                    <p className="assinar2">Assinatura do Comprador</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </Box>

        </ContainerSecundario>


    )
}

export default Contrato
