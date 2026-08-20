import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import Form from '../../../components/form/Form';
import Box from "../../../components/box/Box"
import ContainerSecundario from "../../../components/container/ContainerSecundario"
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';

import { useState, useEffect, useRef } from 'react';
import { useGetData } from '../../../services/useGetData';
import { usePostData } from '../../../services/usePostData';
import { formatTimestamp } from '../../../hooks/formatDate';
import { toUpperCaseData } from '../../../hooks/transformToUppercase';
import { formatMillionUnit } from '../../../hooks/useMask';
import { useAuth } from "../../../hooks/useAuth"

const CadastroVeiculoBIN = () => {
    const [placa, setPlaca] = useState('')
    const [buscaPlaca, setBuscaPlaca] = useState([]);
    const [unidade, setUnidade] = useState('')
    const [selectEstoque, setSelectEstoque] = useState('')
    const [cnpjUnidade, setCnpjUnidade] = useState('')
    const [cambio, setCambio] = useState('')
    const [quilometragem, setQuilometragem] = useState('')
    const [qtd_portas, setQtdPortas] = useState('')
    const [loading, setLoading] = useState(false)
    const [dadosVeiculo, setDadosVeiculo] = useState({
        marca: '', modelo: '', cor: '', renavam: '', ano_modelo: '', ano_fabricacao: '', unidade: '',
        quilometragem: '', combustivel: '', cambio: '', chassi: ''
    })
    const [editavel, setEditavel] = useState(true)

    const { user } = useAuth()

    //Limpa o formulario apos o envio
    const resetForm = () => {
        setPlaca(''); setCambio(''); setQuilometragem(''); setQtdPortas(''); setUnidade(''); setCnpjUnidade(''); setSelectEstoque('')
        setBuscaPlaca({
            marca: '', modelo: '', cor: '',
            renavam: '', ano_fabricacao: '', ano_modelo: ''
        });
        setDadosVeiculo({
            marca: '', modelo: '', cor: '', renavam: '', ano_modelo: '', ano_fabricacao: '', unidade: '',
            quilometragem: '', combustivel: '', cambio: '', chassi: ''
        })
        ultimaPlacaBuscada.current = '';
    };

    //Buscando os dados da loja para o select
    const { data: dadosLoja } = useGetData(`/lojas`);

    // Ordena as lojas por descrição
    const lojasOrdenadas = dadosLoja.sort((a, b) => a.descricao.localeCompare(b.descricao))

    //Buscando os dados na base BIN do Detran
    // A URL da API deve ser ajustada conforme a configuração do backend
    const { data: veiculo } = useGetData(buscaPlaca ? `/veiculos/dados?placa=${placa}` : '');

    // Salvando os dados do veiculo na tabela principal
    const { createData: createEstoquePrincipal } = usePostData('/veiculos');

    // Salvando os dados do veiculo na tabela do estoque extra (pulmao)
    const { createData: createEstoqueExtra } = usePostData('/pulmao');

    // Usando useRef para armazenar a última placa buscada
    // Isso evita que a busca seja feita repetidamente para a mesma placa
    const ultimaPlacaBuscada = useRef('');

    // Usando useRef para armazenar o ID do timeout, permitindo que ele seja limpo se necessário
    const timeoutRef = useRef(null);

    // Função para lidar com o evento de blur do campo placa
    // Ela verifica se a placa tem 7 caracteres e se é diferente da última buscada
    const handleBlur = async () => {
        const placaM = placa.replace(/\s+/g, '').toUpperCase();

        if (placaM.length !== 7) return;

        if (placaM === ultimaPlacaBuscada.current) return;

        ultimaPlacaBuscada.current = placaM;

        setLoading(true);
        setBuscaPlaca(placaM);

        // Limpa timeout anterior (se existir)
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Inicia novo timeout
        timeoutRef.current = setTimeout(() => {
            setLoading(false);
            window.alert('Base BIN offline ou dados do veiculo indisponiveis.\nTente novamente ou insira as informações de forma manual.');
        }, 7000);
    };

    // useEffect para atualizar o estado de carregamento quando o veiculo for atualizado
    useEffect(() => {
        if (veiculo) {
            // Cancela o timeout porque chegou resposta
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            setLoading(false);
        }
    }, [veiculo]);

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

    // Função para lidar com a seleção de unidade e busca do CNPJ
    const handleUnidadeChange = (e) => {
        const selectedOption = e.target.selectedOptions[0]
        const cnpj = selectedOption.getAttribute('data-cnpj')
        const descricao = selectedOption.getAttribute('data-descricao')

        setUnidade(descricao)
        setCnpjUnidade(cnpj)
        console.log('State atualizado - Loja:', descricao, 'CNPJ:', cnpj);
    }

    // Função para mapear os dados da API para o formato do formulário
    const mapVeiculoApiToForm = (veiculo) => ({
        marca: veiculo?.Fabricante ?? '',
        modelo: veiculo?.MarcaModelo ?? '',
        cor: veiculo?.CorVeiculo ?? '',
        ano_fabricacao: veiculo?.AnoFabricacao ?? '',
        ano_modelo: veiculo?.AnoModelo ?? '',
        renavam: veiculo?.renavam ?? '',
        combustivel: veiculo?.Combustivel ?? '',
        chassi: veiculo?.chassi ?? ''
    });

    // useEffect para atualizar os campos do formulário quando os dados do veículo são carregados
    useEffect(() => {
        if (!veiculo || veiculo.erro) return;

        setDadosVeiculo(prev => ({
            ...prev,
            ...mapVeiculoApiToForm(veiculo)
        }));

        setEditavel(true);
    }, [veiculo]);

    // Funçao que eunvia os dados do veículo para o backend
    // Ela formata a data de registro e envia os dados para o backend
    const handleSubmit = async (e) => {
        e.preventDefault();
        const data_registro = formatTimestamp(new Date());

        const tipoDeAquisicao = 'COMUM'

        let dados = {
            placa,
            data_registro,
            unidade,
            cambio,
            quilometragem,
            qtd_portas,
            cnpjUnidade,
            marca: veiculo?.Fabricante ?? dadosVeiculo?.marca,
            modelo: veiculo?.MarcaModelo ?? dadosVeiculo?.modelo,
            cor: veiculo?.CorVeiculo ?? dadosVeiculo?.cor,
            ano_fabricacao: veiculo?.AnoFabricacao ?? dadosVeiculo?.ano_fabricacao,
            ano_modelo: veiculo?.AnoModelo ?? dadosVeiculo?.ano_modelo,
            renavan: veiculo?.renavam ?? dadosVeiculo?.renavam,
            combustivel: veiculo?.Combustivel ?? dadosVeiculo?.combustivel,
            chassi: veiculo?.chassi ?? dadosVeiculo?.chassi,
            audit: user?.nome,
            tipoAquisicao: tipoDeAquisicao
        };

        // normaliza os campos para maiúsculo
        dados = toUpperFields(dados, ['placa', 'marca', 'modelo', 'cor', 'unidade', 'combustivel']);
        console.log('Dados a serem enviados:', dados); // Debug

        const confirmar = window.confirm("Confirma o cadastro do veículo?");
        if (!confirmar) return;

        if (placa === "" ||
            unidade === "" ||
            cambio === "" ||
            quilometragem === "" ||
            dados.marca === "" ||
            dados.modelo === "" ||
            dados.cor === "" ||
            dados.ano_fabricacao === "" ||
            dados.ano_modelo === "" ||
            dados.renavan === "" ||
            dados.combustivel === "" ||
            dados.chassi === "" ||
            cambio === "" ||
            qtd_portas === "" || "") {
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

                    const dadosUpper = toUpperCaseData(dados);
                    const respostaEstoqueExtra = await createEstoqueExtra(dadosUpper);
                    
                    if (respostaEstoqueExtra.success) {
                        window.alert('Veículo cadastrado no Pulmao com sucesso');
                        resetForm() //Chama a função que limpa o formulario
                        //window.location.reload();
                    } else {
                        
                        window.alert('Não há vagas disponíveis para esta loja.\nCadastro não realizado.');
                    }

                } else {

                    // Só permite o cadastro se houver vagas disponíveis

                    const dadosUpper = toUpperCaseData(dados);
                    const respostaEstoquePrincipal = await createEstoquePrincipal(dadosUpper);
                    if (respostaEstoquePrincipal.success) {

                        resetForm() //Chama a função que limpa o formulario
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
        };
    }

    return (
        <div>
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
                            <a className="link_a" href="/gestao_estoque">Gestão de Estoque</a>
                        </div>
                        <div className="p-2">
                            <i className=' ti ti-angle-right ' id='card-path' />
                        </div>
                        <div className="p-2">
                            <p className='atual'>Cadastro de Veiculos</p>
                        </div>
                    </div>
                </div>
                <div className="container d-flex justify-content-center card-container">
                    <Box >
                        <div className='panel-heading'>
                            <i className='ti ti-car' id="ti-black" ></i>
                            <p>CADASTRO DE VEICULOS<br /> Selecione a loja e informe a placa do veículo para buscar os dados na Base BIN do Detran.
                                <br></br> Caso os dados nao estejam disponiveis na Base BIN, insira as informações manualmente.</p>
                        </div>
                        <Form onSubmit={handleSubmit}>
                            <div className='col-12 col-md-3' id='select-all'>
                                <label className="label" id="select-label"><span>Loja:</span></label>
                                <select type='text' name='loja' value={unidade} onChange={handleUnidadeChange} className="select-item" required >
                                    <option value="" >SELECIONE UMA LOJA</option>
                                    {lojasOrdenadas.map((loja) => (
                                        <option key={loja.descricao} value={loja.descricao} data-descricao={loja.descricao} data-cnpj={loja.cnpj}>
                                            {loja.descricao}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='col-12 col-md-4' id='select-all'>
                                <label className="label" id="select-label"><span>Estoque:</span></label>
                                <select type='text' name='loja' value={selectEstoque} onChange={(e) => setSelectEstoque(e.target.value)} className="select-item" required >
                                    <option value='' >SELECIONE UM ESTOQUE</option>
                                    <option value='principal'>ESTOQUE PRINCIPAL</option>
                                    <option value='pulmao'disabled={true}>ESTOQUE EXTRA</option>
                                </select>
                            </div>
                            <div className="col-12 col-md-2">
                                <Input label={"Placa:"} type={"text"} maxLength={"7"} style={{ width: '95px' }} nameInput={"placa"}
                                    value={placa} onChange={(e) => setPlaca(e.target.value)} onBlur={handleBlur} required />
                            </div>
                            {/* Exibe o spinner de carregamento enquanto os dados estão sendo buscados */}
                            {loading && (
                                <div className="spinner-border" role="status"></div>
                            )}

                            <div className="col-12 col-md-4">
                                <Input label={"Marca:"} type={"text"} style={{ width: '150px' }} nameInput={"marca"} value={dadosVeiculo.marca} required readOnly={!editavel}
                                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, marca: e.target.value }))} />
                            </div>
                            <div className="col-12 col-md-4">
                                <Input label={"Modelo:"} type={"text"} style={{ width: '150px' }} nameInput={"modelo"} value={dadosVeiculo.modelo} required readOnly={!editavel}
                                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, modelo: e.target.value }))} />
                            </div>
                            <div className="col-12 col-md-4">
                                <Input label={"Cor:"} type={"text"} style={{ width: '150px' }} nameInput={"cor"} value={dadosVeiculo.cor} required readOnly={!editavel}
                                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, cor: e.target.value }))} />
                            </div>
                            <div className="col-12 col-md-3">
                                <Input label={"Combustível:"} type={"text"} style={{ width: '150px' }} nameInput={"combustivel"} value={dadosVeiculo.combustivel} required readOnly={!editavel}
                                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, combustivel: e.target.value }))} />
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
                            <div className="col-12 col-md-3">
                                <Input label={"Qtd Portas:"} type={"text"} style={{ width: '50px' }} nameInput={"qtdPortas"} value={qtd_portas}
                                    onChange={(e) => setQtdPortas(e.target.value)} required />
                            </div>
                            <div className="col-12 col-md-3">
                                <Input label={"Ano Fabricacao:"} type={"text"} style={{ width: '80px' }} nameInput={"anoFabricacao"} value={dadosVeiculo.ano_fabricacao} required readOnly={!editavel}
                                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, ano_fabricacao: e.target.value }))} />
                            </div>
                            <div className="col-12 col-md-3">
                                <Input label={"Ano Modelo:"} type={"text"} style={{ width: '80px' }} nameInput={"anoModelo"} value={dadosVeiculo.ano_modelo} required readOnly={!editavel}
                                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, ano_modelo: e.target.value }))} />
                            </div>
                            <div className="col-12 col-md-3">
                                <Input label={"Renavan:"} type={"text"} style={{ width: '150px' }} nameInput={"renavam"} value={dadosVeiculo.renavam} required readOnly={!editavel}
                                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, renavam: e.target.value }))} />
                            </div>
                            <div className="col-12 col-md-4">
                                <Input label={"Chassi:"} type={"text"} style={{ width: '200px' }} nameInput={"chassi"} value={dadosVeiculo.chassi} required readOnly={!editavel}
                                    onChange={(e) => setDadosVeiculo(prev => ({ ...prev, chassi: e.target.value }))} />
                            </div>
                            <div className="d-flex flex-row-reverse" >
                                <Button onClick={handleSubmit} variant='primary'>ENVIAR</Button>
                            </div>
                        </Form>
                    </Box>
                </div>
            </ContainerSecundario>
        </div>
    )
}


export default CadastroVeiculoBIN