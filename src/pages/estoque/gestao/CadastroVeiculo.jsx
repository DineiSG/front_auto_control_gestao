import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import Form from '../../../components/form/Form';
import Box from "../../../components/box/Box"
import ContainerSecundario from "../../../components/container/ContainerSecundario"
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';

import { useState } from 'react';
import { useGetData } from '../../../services/useGetData';
import { usePostData } from '../../../services/usePostData';
import { formatTimestamp } from '../../../hooks/formatDate';
import { toUpperCaseData } from '../../../hooks/transformToUppercase';
import { onlyNumbers, formatMillionUnit } from "../../../hooks/useMask";



const CadastroVeiculo = () => {

    const [marca, setMarca] = useState('')
    const [modelo, setModelo] = useState('')
    const [cor, setCor] = useState('')
    const [placa, setPlaca] = useState('')
    const [ano_fabricacao, setAnoFabricacao] = useState('')
    const [ano_modelo, setAnoModelo] = useState('')
    const [renavan, setRenavan] = useState('')
    const [unidade, setUnidade] = useState('')
    const [combustivel, setCombustivel] = useState([]);
    const [selectEstoque, setSelectEstoque] = useState('')
    const [cnpj_unidade, setCnpjUnidade] = useState('')
    const [cambio, setCambio] = useState('')
    const [quilometragem, setQuilometragem] = useState('')
    const [qtd_portas, setQtdPortas] = useState('')

    const resetForm = () => {
        setPlaca('');
        setCambio('');
        setQuilometragem('');
        setQtdPortas('');
        setUnidade('');
        setSelectEstoque('');
        setCnpjUnidade('');
        setMarca('');
        setModelo('');
        setCor('');
        setAnoFabricacao('');
        setAnoModelo('');
        setRenavan('');
        setCombustivel('');
    }

    // Busca dados das lojas
    const { data: dadosLoja } = useGetData(`/lojas`)
    // Envia os dados do veículo
    const { loading, createData } = usePostData('/veiculos')
    const { createEstoqueExtra } = usePostData('/pulmao');

    // Ordena as lojas por descrição
    const lojasOrdenadas = dadosLoja.sort((a, b) => a.descricao.localeCompare(b.descricao))

    // Função para converter campos em CAIXA ALTA
    const toUpperFields = (obj, fields = []) => {
        const copy = { ...obj }
        fields.forEach((f) => {
            if (copy[f] !== undefined && copy[f] !== null) {
                copy[f] = String(copy[f]).toUpperCase()
            }
        })
        return copy
    }

    // Função para lidar com o envio do formulário
    const handleSubmit = async (e) => {
        e.preventDefault()

        const data_registro = formatTimestamp(new Date())

        //Validaçao do campo placa para garantir que tenha exatamente 7 caracteres, desconsiderando espaços em branco
        const qtdCaracteres = placa.replace(/\s+/g, '')
        if (qtdCaracteres.length !== 7) {
            window.alert("O campo placa precisa ter 7 caracteres. Por favor verfique e tente novamente.")
            return
        }

        // Envia nome da loja no campo 'unidade'
        let dados = { placa, data_registro, unidade, marca, modelo, cor, ano_fabricacao, ano_modelo, renavan, cnpj_unidade, combustivel, qtd_portas, cambio, quilometragem }

        console.log('Dados a serem enviados: ', dados)
        // Padroniza para caixa alta
        dados = toUpperFields(dados, ['placa', 'marca', 'modelo', 'cor', 'unidade', 'combustivel']);
        console.log('Dados a serem enviados:', dados);

        // Validação de confirmação
        const confirmar = window.confirm("Confirma o cadastro do veículo?");
        if (!confirmar) return;

        if (placa === "" ||
            marca === "" ||
            modelo === "" ||
            cor === "" ||
            quilometragem === "" ||
            cambio === "" ||
            qtd_portas === "" ||
            renavan === "" ||
            ano_fabricacao === "" ||
            ano_modelo === "" ||
            unidade === "" ||
            selectEstoque === "") {
            window.alert("Por favor, verifique o formulario novamente, todos os campos precisam ser preenchidos.")
            return
        } else {
            try {
                // Verifica se a placa já existe antes de enviar os dados
                const url = selectEstoque === 'pulmao'
                    ? `${import.meta.env.VITE_API_BASE_URL}/pulmao/placa/${dados.placa}`
                    : `${import.meta.env.VITE_API_BASE_URL}/veiculos/placa/${dados.placa}`;

                const existente = await fetch(url).then((res) => res.ok ? res.json() : null);

                if (existente) {
                    window.alert("Já existe um veículo cadastrado com esta placa!");
                    return;

                } else if (selectEstoque === 'pulmao') {
                    // Busca a quantidade de veículos na unidade selecionada
                    const responseUnidade = await fetch(`${import.meta.env.VITE_API_BASE_URL}/pulmao/unidade/${unidade}`);
                    const data = await responseUnidade.json();
                    const filteredResults = data.filter((veiculo) => veiculo.placa !== "").length;
                    console.log("Quantidade de veiculos: ", filteredResults);

                    // Busca a quantidade total de vagas da loja
                    const responseLoja = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lojas`);
                    const dataLoja = await responseLoja.json();
                    const loja = dataLoja.find((loja) => loja.descricao === dados.unidade);
                    const vagasTotais = parseInt(loja.qtdEstoqueExtra, 10);
                    console.log("Quantidade de vagas informadas no cadastro da loja: ", vagasTotais);

                    //Vagas disponiveis sera obtido da subtração das vagas totais informado no cadastro da loja menos a quantidade de veiculos ja cadastrados
                    const vagasDisponiveis = vagasTotais - filteredResults;
                    console.log(`Quantidade de vagas disponíveis: ${vagasDisponiveis - 1}`);

                    // Só permite o cadastro se houver vagas disponíveis
                    if (vagasDisponiveis > 0) {
                        const dadosUpper = toUpperCaseData(dados);
                        await createEstoqueExtra(dadosUpper);
                        window.alert('Veículo cadastrado no Pulmao com sucesso');
                        resetForm() //Chama a função que limpa o formulario
                        //window.location.reload();
                    } else {
                        window.alert('Não há vagas disponíveis para esta loja.\nCadastro não realizado.');
                    }

                } else {
                    // Busca a quantidade de veículos na unidade selecionada
                    const responseUnidade = await fetch(`${import.meta.env.VITE_API_BASE_URL}/veiculos/unidade/${unidade}`);
                    const data = await responseUnidade.json();
                    const filteredResults = data.filter((veiculo) => veiculo.placa !== "").length;
                    console.log("Quantidade de veiculos: ", filteredResults);

                    // Busca a quantidade total de vagas da loja
                    const responseLoja = await fetch(`${import.meta.env.VITE_API_BASE_URL}/lojas`);
                    const dataLoja = await responseLoja.json();
                    const loja = dataLoja.find((loja) => loja.descricao === dados.unidade);
                    const vagasTotais = parseInt(loja.qtdVeiculos, 10);
                    console.log("Quantidade de vagas informadas no cadastro da loja: ", vagasTotais);

                    //Vagas disponiveis sera obtido da subtração das vagas totais informado no cadastro da loja menos a quantidade de veiculos ja cadastrados
                    const vagasDisponiveis = vagasTotais - filteredResults;
                    console.log(`Quantidade de vagas disponíveis: ${vagasDisponiveis - 1}`);

                    // Só permite o cadastro se houver vagas disponíveis
                    if (vagasDisponiveis > 0) {
                        const dadosUpper = toUpperCaseData(dados);
                        await createData(dadosUpper);

                        resetForm()
                        window.alert('Veículo cadastrado com sucesso');
                        //window.location.reload();
                    } else {
                        window.alert('Não há vagas disponíveis para esta loja.\nCadastro não realizado.');
                    }
                }

            } catch (err) {
                console.error('Falha ao registrar o veículo: ', err);
                window.alert('Erro ao tentar registrar o veículo.\nEntre em contato com o suporte.');
            }
        }
    }

    // Função para lidar com a mudança de unidade

    // Função para lidar com a seleção de unidade e busca do CNPJ
    const handleUnidadeChange = (e) => {
        const selectedOption = e.target.selectedOptions[0]
        const cnpj = selectedOption.getAttribute('data-cnpj')
        const descricao = selectedOption.getAttribute('data-descricao')

        setUnidade(descricao)
        setCnpjUnidade(cnpj)
        console.log('State atualizado - Loja:', descricao, 'CNPJ:', cnpj);
    }

    return (
        <ContainerSecundario>
            <div className='container d-flex flex-column ' id="path" >
                <div className="d-flex align-items-start ">
                    <div className="p-2"> <a className="link_a" href="/home"> Gestão</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <a className="link_a" href="/gestao_estoque"> Gestão de Estoque </a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <p className='atual'> Cadastro de Veículos </p>
                    </div>
                </div>
            </div>
            <div className="container d-flex justify-content-center card-container">
                <Box>
                    <div className='panel-heading'>
                        <i className='ti ti-car' id="ti-black"></i>
                        <p>CADASTRO DE VEICULOS SEM CONSULTA À BASE BIN <br /> Selecione a loja e informe os demais dados do veículo.</p>
                    </div>
                    <Form onSubmit={handleSubmit}>
                        <div className='col-12 col-md-3' id='select-all'>
                            <label className="label" id="select-label"><span>Loja:</span></label>
                            <select type='text' name='loja' value={unidade} onChange={handleUnidadeChange} className="select-item" required >
                                <option value="" >SELECIONE UMA LOJA</option>
                                {lojasOrdenadas.map((loja) => (
                                    <option key={loja.descricao} value={loja.descricao} data-descricao={loja.descricao}>
                                        {loja.descricao}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className='col-12 col-md-4' id='select-all'>
                            <label className="label" id="select-label"><span>Estoque:</span></label>
                            <select type='text' name='loja' value={selectEstoque} onChange={(e) => setSelectEstoque(e.target.value)} className="select-item" required >
                                <option value='' >SELECIONE UM ESTOQUE</option>
                                <option value='veiculos'>ESTOQUE PRINCIPAL</option>
                                <option values='pulmao' disabled={true}>ESTOQUE EXTRA</option>
                            </select>
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Placa:"} type={"text"} maxLength={"7"} style={{ width: '80px' }} nameInput={"placa"}
                                value={placa} onChange={(e) => setPlaca(e.target.value)} required />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Marca:"} type={"text"} style={{ width: '150px' }} nameInput={"marca"}
                                value={marca} onChange={(e) => setMarca(e.target.value)} required />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Modelo:"} type={"text"} style={{ width: '150px' }} nameInput={"modelo"}
                                value={modelo} onChange={(e) => setModelo(e.target.value)} required />
                        </div>
                        <div className="col-12 col-md-4">
                            <Input label={"Cor:"} type={"text"} style={{ width: '150px' }} nameInput={"cor"}
                                value={cor} onChange={(e) => setCor(e.target.value)} required />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Combustível:"} type={"text"} style={{ width: '150px' }} nameInput={"combustivel"} value={combustivel}
                                onChange={(e) => setCombustivel(e.target.value)} required />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Km:"} type={"text"} style={{ width: '150px' }} nameInput={"quilometragem"} value={quilometragem}
                                onChange={(e) => setQuilometragem(formatMillionUnit(e.target.value))} required />
                        </div>
                        <div className="col-12 col-md-4" id="select-all">
                            <label className="label" id="select-label"><span>Câmbio:</span></label>
                            <select label={"Cambio:"} type={"text"} style={{ width: '260px' }} value={cambio} onChange={(e) => setCambio(e.target.value)}>
                                <option value="">SELECIONE O TIPO DE CÂMBIO</option>
                                <option value="manual">MANUAL</option>
                                <option value="automatico">AUTOMÁTICO</option>
                            </select>
                        </div>
                        <div className="col-12 col-md-4">
                            <Input label={"Qtd Portas:"} type={"text"} style={{ width: '50px' }} nameInput={"qtdPortas"} value={qtd_portas}
                                onChange={(e) => setQtdPortas(e.target.value)} required />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Ano Fabricacao:"} type={"text"} maxLength={4} style={{ width: '80px' }} nameInput={"anoFabricacao"}
                                value={ano_fabricacao} onChange={(e) => setAnoFabricacao(onlyNumbers(e.target.value))} required />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Ano Modelo:"} type={"text"} maxLength={4} style={{ width: '80px' }} nameInput={"anoModelo"}
                                value={ano_modelo} onChange={(e) => setAnoModelo(onlyNumbers(e.target.value))} required />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Renavam:"} type={"text"} style={{ width: '150px' }} nameInput={"renavam"}
                                value={renavan} onChange={(e) => setRenavan(onlyNumbers(e.target.value))} required />
                        </div>
                        <div className="d-flex flex-row-reverse">
                            <Button type="submit" variant='primary'>
                                {loading && (
                                    <div className="spinner-grow spinner-grow-sm flex-row-start" style={{ marginRight: '15px' }} role="status" > </div>
                                )}
                                ENVIAR
                            </Button>
                        </div>
                    </Form>
                </Box>
            </div>
        </ContainerSecundario>

    )
}

export default CadastroVeiculo
