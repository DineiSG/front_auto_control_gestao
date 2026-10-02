import ContainerSecundario from '../../../components/container/ContainerSecundario'
import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import Box from '../../../components/box/Box';
import Input from '../../../components/input/Input';
import Form from '../../../components/form/Form';
import Button from '../../../components/button/Button';
import { useState, useEffect, useRef } from "react";
import { useGetData } from '../../../services/useGetData';
import { usePostData } from '../../../services/usePostData';
import { useAuth } from "../../../hooks/useAuth"
import TextArea from '../../../components/text_area/TextArea';

const RegistrarDevolTransf = () => {


    const [placa, setPlaca] = useState('')
    const [buscaPlaca, setBuscaPlaca] = useState("")
    const [observacao, setObservacao] = useState('')
    const [dadosVeiculo, setDadosVeiculo] = useState({ placa: '', marca: '', modelo: '', cor: '', unidade: '' })

    const resetForm = () => {
        setDadosVeiculo({ placa: '', marca: '', modelo: '', cor: '', unidade: '' });
        setObservacao('')
    }

    // Base URL da API
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // buscando os dados no bd
    const { data: veiculo } = useGetData(buscaPlaca ? `/veiculos/placa/${placa}` : null)

    //
    const { createData, loading } = usePostData('/solicitacoes');

    //Usuario autenticado
    const { user } = useAuth()
    const usuarioAtivo = user?.nome.split('.').toString()
    console.log('Usuário ativo: ', usuarioAtivo)

    // Ref para manter a referência atualizada da última placa buscada
    const ultimaPlacaBuscada = useRef('');

    // Função chamada quando o input da placa perde o foco
    const handleBlur = async () => {

        const placaM = placa.trim().toUpperCase();
        console.log(`Placa buscada: ${placaM}`);

        if (placaM.length !== 7) return;

        if (placaM === ultimaPlacaBuscada.current) return;

        ultimaPlacaBuscada.current = placaM;

        // Verificaçao e busca de dados de veiculo
        try {

            // 1 Verificando se o veiculo pertence à loja ativa
            const lojaVeiculo = await fetch(`${API_BASE_URL}/veiculos/placa/${placaM}`);
            const dados = await lojaVeiculo.json()
            console.log(`Dados do veículo: ${dados}`)

            if (dados.unidade !== usuarioAtivo) {

                window.alert("O veiculo correspondente a essa placa nao pertence a essa unidade. Operação nao permitida.")
                window.location.reload()
            }

            // 2 Verifica se ja existe alguma solicitação para a placa informada
            const resVenda = await fetch(`${API_BASE_URL}/solicitacoes/placa/${placaM}`);

            if (resVenda.status === 200) {

                window.alert('Ja consta uma solicitacao registrada para esta placa.');
                window.location.reload()

            } else if (resVenda.status === 404) {
                setBuscaPlaca(placaM);

            }

        } catch (erro) {
            console.error('Erro ao buscar placa:', erro);
            setDadosVeiculo({ placa: '', marca: '', modelo: '', cor: '', renavam: '', unidade: '' });
            setBuscaPlaca(placaM);
        }
    };

    // Preencher campos quando os dados solicitados chegarem
    useEffect(() => {
        if (veiculo && !veiculo.erro) {
            // Debug
            setDadosVeiculo(prev => ({
                ...prev,
                marca: veiculo.marca || '',
                modelo: veiculo.modelo || '',
                cor: veiculo.cor || '',
                unidade: veiculo.unidade || ''
            }));
        } else if (veiculo && veiculo.erro) {
            console.log('Veículo não encontrado');;
        }

    }, [veiculo])

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

    const handleSubmit = async (e) => {
        e.preventDefault()

        //Dados que serao enviados para o bd
        let dados = {
            placa, id: veiculo.id, marca: veiculo.marca, modelo: veiculo.modelo, cor: veiculo.cor, unidade: veiculo.unidade,
            observacao
        }

        // Padroniza para caixa alta
        dados = toUpperFields(dados, ['placa', 'marca', 'modelo', 'cor', 'unidade', 'observacoes'
        ])

        const confirmou = window.confirm("Confirma o registro devolução/transferencia?")
        if (!confirmou) {
            window.alert('Registro de devolução/transferencia cancelado')
            return
        }

        // Validação simples dos campos obrigatórios
        if (!window.confirm.ok && observacao === "") {
            window.alert("Por favor, verifique o formulario novamente e preencha todos os campos")
        } else {
            try {
                const resultado = await createData(dados)
                console.log('Registro realizado com sucesso, ', resultado)
                window.alert('Registro realizado com sucesso.')
                resetForm() //Chama a função que limpa o formulario
                window.scrollTo({ top: 0, behavior: 'smooth' });//Retorna a pagina para o topo
            } catch (err) {
                window.alert("Não foi possivel realizar o Registro de devolução ou transferencia.\nFavor entrar em contato com o suporte.")
                console.error('Falha ao registrar a venda: ', err)
            }
        }
    }



    return (
        <ContainerSecundario>
            <div className='container d-flex flex-column ' id="path" >
                <div className="d-flex align-items-start ">
                    <div className="p-2">
                        <a className="link_a" href="/home">Início</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <a className="link_a" href="/lojista/">Lojista</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <p className='atual'>Devolução ou Transferencia </p>
                    </div>
                </div>
            </div>
            <div className="container d-flex justify-content-center card-container">
                <Box>
                    <div className='panel-heading'>
                        <i className='ti ti-share' id="ti-black" ></i>
                        <p>REGISTRAR A DEVOLUÇÃO OU TRANSFERENCIA DE UM VEÍCULO <br /> Informe a placa do veículo para obter os dados</p>
                    </div>
                    <Form>
                        <div className="col-12 col-md-2">
                            <Input label={"Placa:"} type={"text"} maxLength={"7"} style={{ width: '80px' }} nameInput={"placa"}
                                value={placa} onChange={(e) => setPlaca(e.target.value)} onBlur={handleBlur} required />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Marca:"} type={"text"} style={{ width: '150px' }} nameInput={"marca"} value={dadosVeiculo.marca} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Modelo:"} type={"text"} style={{ width: '150px' }} nameInput={"modelo"} value={dadosVeiculo.modelo} readOnly />
                        </div>
                        <div className="col-12 col-md-4">
                            <Input label={"Cor:"} type={"text"} style={{ width: '150px' }} nameInput={"cor"} value={dadosVeiculo.cor} readOnly />
                        </div>
                        <div className="col-6 col-md-12">
                            <TextArea label={"Descrição do Registro:"} type={"text"} style={{ width: '250px' }} nameInput={"descricao"}
                                value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Descreva aqui o motivo da devolução ou transferência do veiculo" required />
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="col-6 d-flex flex-row-start">
                                {loading && (
                                    <div className="spinner-grow spinner-grow-sm flex-row-start" style={{ marginRight: '15px' }} role="status" > </div>
                                )}
                                <div className="d-flex flex-row-start">
                                    <Button onClick={handleSubmit} variant='primary' >ENVIAR</Button>
                                </div>
                            </div>
                        </div>
                    </Form>
                </Box>

            </div>


        </ContainerSecundario>

    )
}

export default RegistrarDevolTransf
