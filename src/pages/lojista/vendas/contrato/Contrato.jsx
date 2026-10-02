import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './Contrato.css';
import ContainerSecundario from '../../../../components/container/ContainerSecundario';
const Contrato = () => {

    const [placa, setPlaca] = useState("");
    const [inputValue, setInputValue] = useState("");
    const [dadosVenda, setDadosVenda] = useState({});
    const location = useLocation();
    const placaInicial = location.state?.placa || '';


    useEffect(() => {
        if (placaInicial) {
            setPlaca(placaInicial);
        }
    }, [placaInicial]);

    function converterParaMaiusculo(texto) {
        return texto.toUpperCase();
    }

    const buscarDados = async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            const textoMaiusculo = converterParaMaiusculo(placa);
            try {
                // --- Buscar dados financeiros e do comprador ---
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
                const anoFabricacao = dados.ano_fabricacao || "N/A";
                const anoModelo = dados.ano_modelo || "N/A";
                const renavam = dados.renavan || "N/A";

                setInputValue({
                    placa: placaRetorno,
                    marca,
                    modelo,
                    cor,
                    ano: `${anoFabricacao}/${anoModelo}`,
                    renavam
                });
            } catch (error) {
                console.error("Erro na consulta: ", error);
                alert("Erro ao buscar os dados do veículo.");
            }
        }
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    function placadInput(placaLocal, inputValue) {
        return inputValue.placa || placaLocal;
    }



    return (
        <ContainerSecundario>

            <div id="corpo_contrato">
                <div className='container-sm' id='printable'>

                    {/* Cabeçalho Superior */}
                    <div className="superior-layout">
                        <div className="logo-container">
                            <img src="./aspa.png" alt='Auto Shopping' title='Auto Shopping' className="logo" />
                        </div>
                        <div className="qr-container">
                            <img src="./QR.jpg" alt='Passeio das Aguas' title='Passeio das Aguas' className="qr-img" />
                            <span className="qr-legenda">Escaneie o QR Code e instale o aplicativo agora mesmo.</span>
                        </div>
                        <div className="info-topo-box">
                            <div className="linha-topo">Nº da Venda {dadosVenda.contrato || "---"}</div>
                            <div className="linha-topo-data">{formatTimestamp(dadosVenda.registro)}</div>
                        </div>
                    </div>

                    <div className="corpo_contrato2">
                        <p className="descricao">PARA PARTICIPAÇÃO NO <strong>"PROGRAMA DE BENEFÍCIOS"</strong> DO PASSEIO DAS ÁGUAS SHOPPING.</p>

                        <div className="body2" onKeyDown={buscarDados}>

                            {/* 1. DADOS DO COMPRADOR */}
                            <div className="secao-tabela">
                                <h4 className="secao-titulo">1. DADOS DO COMPRADOR(A)</h4>
                                <table className="tabela-dados">
                                    <tbody>
                                        <tr>
                                            <td className="td-label" style={{ width: "70%" }}>Nome/Razão Social: <strong>{dadosVenda.comprador || ""}</strong></td>
                                            <td className="td-label">CPF/CNPJ: <strong>{dadosVenda.cpf || ""}</strong></td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2" className="td-label">
                                                Endereço: {dadosVenda.rua}, {dadosVenda.endereco}, {dadosVenda.bairro}, CEP: {dadosVenda.cep}, {dadosVenda.cidade} - {dadosVenda.estado}
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="td-label">Email: {dadosVenda.email || ""}</td>
                                            <td className="td-label">Contato: {dadosVenda.telefone || ""}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* 2. DADOS DO VENDEDOR */}
                            <div className="secao-tabela">
                                <h4 className="secao-titulo">2. DADOS DO VENDEDOR(A)</h4>
                                <table className="tabela-dados">
                                    <tbody>
                                        <tr>
                                            <td className="td-label" style={{ width: "70%" }}>Nome/Razão Social: <strong>Auto Shopping Passeio das Águas</strong></td>
                                            <td className="td-label">CPF/CNPJ: <strong>06.171.601/0001-43</strong></td>
                                        </tr>
                                        <tr>
                                            <td colSpan="2" className="td-label">
                                                Endereço: AV. PERIMETRAL NORTE, Nº 8303, PASSEIO DAS ÁGUAS, CRIMEIA CAVEIRAS, CEP 74593-841, GOIÂNIA - GO
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="td-label">Email: adm@autoshoppinggo.com.br</td>
                                            <td className="td-label">Contato: (62) 9 8123-0063</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* DADOS DO VEÍCULO */}
                            <div className="secao-tabela">
                                <table className="tabela-dados">
                                    <thead>
                                        <tr>
                                            <th colSpan="3" className="tb_title">DADOS DO VEÍCULO</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td className="td-label">
                                                Placa: <input
                                                    className="input-inline-placa"
                                                    type='text'
                                                    value={placadInput(placa, inputValue)}
                                                    onChange={(e) => setPlaca(e.target.value.toUpperCase())}
                                                    placeholder='Digite a placa e Enter'
                                                />
                                            </td>
                                            <td className="td-label">Marca: {inputValue.marca || "N/A"}</td>
                                            <td className="td-label">Cor: {inputValue.cor || "N/A"}</td>
                                        </tr>
                                        <tr>
                                            <td className="td-label">Modelo: {inputValue.modelo || "N/A"}</td>
                                            <td className="td-label">Ano Fab/Mod: {inputValue.ano || "N/A"}</td>
                                            <td className="td-label">Renavam: {inputValue.renavam || "N/A"}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* DADOS FINANCEIROS */}
                            <div className="secao-tabela">
                                <h4 className="secao-titulo-fin">DADOS FINANCEIROS</h4>
                                <table className="tabela-dados">
                                    <tbody>
                                        <tr>
                                            <td className="td-label" style={{ width: "30%" }}><strong>VALOR DE VENDA:</strong></td>
                                            <td className="td-label">R$ {dadosVenda.valorVenda}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* TERMO DE PARTICIPAÇÃO */}
                            <div className="termos">
                                <h3 className="condicoes_2">TERMO DE PARTICIPAÇÃO</h3>
                                <h6><strong>Descrição da Promoção:</strong></h6>
                                <p>Todo cliente que adquirir um veículo em qualquer loja do Auto Shopping Passeio das Águas e realizar o cadastro no aplicativo oficial do Passeio das Águas Shopping, terá direito a concorrer:</p>

                                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                                    <li>⭐ 1 IPad 11 enviando 1 Nota Fiscal.</li>
                                    <li>⭐⭐ 1 MacBook Neo 1 Nota Fiscal.</li>
                                    <li>⭐⭐⭐ 1 IPhone 18 Pro enviando 1 Nota Fiscal.</li>
                                </ul>

                                <h6><strong>Requisitos para participar</strong></h6>
                                <ol>
                                    <li>Compre produtos ou serviços em todo o shopping;</li>
                                    <li>Envie as notas das compras no app;</li>
                                    <li>Resgate seu/s número/s da sorte;</li>
                                </ol>

                                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                                    <li>⭐ : 1 número da sorte.</li>
                                    <li>⭐⭐ : 1 número da sorte.</li>
                                    <li>⭐⭐⭐ : 1 número da sorte.</li>
                                </ul>

                                <h6><strong>Números Extras - Auto Shopping</strong></h6>
                                <ol>
                                    <li>Realize uma compra na loja citada do Passeio das Águas;</li>
                                    <li>Envie sua NF pelo app;</li>
                                    <li>Resgate seu/s número/s da sorte;</li>
                                    <li>Pronto! Você receberá 5 números extras!</li>
                                </ol>
                                <p><strong>Obs:</strong>Limitado a 5 números extra por CPF. </p>

                                <p>Este termo faz parte integrante das Regras Gerais da Promoção e o participante, ao aderir à campanha, declara ciência e concordância com todos os seus termos e condições.</p>
                                <p>As partes reconhecem e concordam que este documento é exclusivamente para fins informativos, não constitui contrato vinculativo, tampouco gera obrigações legais de qualquer natureza, nem configura compromisso, direito ou obrigação juridicamente exigível por qualquer das partes.</p>

                                <p>Promoção válida de <strong style={{ color: "red" }}>01/10/2026 a 12/11/2026</strong>. Sorteio Loteria Federal:<strong> 25/11/2026.</strong> A apuração acontecerá no dia <strong>26/11/2026</strong>, às 14 horas e os resultados serão divulgados no APP do Passeio das Águas Shopping e nas redes sociais, em até <strong>10(dez)</strong> dias úteis após a apuração.</p>
                            </div>

                            <p className="data_contrato" style={{ textAlign: 'center', marginTop: '20px' }}><strong>GOIANIA, {new Date().toLocaleDateString()}.</strong></p>

                            <div className="assinatura2" style={{ marginTop: '40px' }}>
                                <center>
                                    <input className="linha2" readOnly />
                                    <p className="assinar2">Assinatura do Comprador</p>
                                </center>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ContainerSecundario>
    );
}




export default Contrato
