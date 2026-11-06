import ContainerSecundario from '../../../components/container/ContainerSecundario'
import Box from '../../../components/box/Box';
import Input from '../../../components/input/Input';
import Form from '../../../components/form/Form';
import Button from '../../../components/button/Button';
import ModalBootstrap from '../../../components/modal/ModalBootstrap';

import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import { formatCPF } from "../../../hooks/useMask"
import { formatDateInfo } from '../../../hooks/formatDate';
import { useState, useEffect, useRef } from "react";
import { useGetData } from '../../../services/useGetData';
import { usePostData } from '../../../services/usePostData';
import { useDeleteId } from '../../../services/useDeleteId';
import { useAuth } from '../../../hooks/useAuth'


const SolicitarLiberacao = () => {
    const [placa, setPlaca] = useState('')
    const [placaDelete, setPlacaDelete] = useState('')
    const [solicitante, setSolicitante] = useState('')
    const [observacoes, setObservacoes] = useState('')
    const [buscaPlaca, setBuscaPlaca] = useState("")
    const [buscaPlacaDelete, setBuscaPlacaDelete] = useState("")
    const [selectedMotivo, setSelectedMotivo] = useState('')
    const [confirmaCpf, setConfirmaCpf] = useState('')
    const [mostrarSelect, setMostrarSelect] = useState(false)

    // Estado para controlar o modal
    const [modal, setModal] = useState({
        aberto: false,
        titulo: "Atenção",
        mensagem: "",
        tipo: "mensagem",
        acao: null
    });
    const [deleteDados, setDeleteDados] = useState({
        id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
        unidade: '', motivo: '', dataRegistro: '', data_cadastro: ''
    })
    const [dadosVeiculo, setDadosVeiculo] = useState({
        id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
        unidade: '', motivo: '', dataRegistro: '', data_cadastro: ''
    })

    //Função para resetar o formulario após o envio ou cancelamento da liberação
    const resetForm = () => {
        setPlaca('')
        setPlacaDelete('')
        setSelectedMotivo('')
        setConfirmaCpf('')
        setMostrarSelect(false)
        setDeleteDados({
            id: '', placa: '', tipoMovimentacao: '', responsavelMovimentacaoNome: '', observacaoMovimentacao: ''
        })
        setDadosVeiculo({
            id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
            unidade: '', motivo: '', dataRegistro: '', data_cadastro: '', ano_fabricacao: '', ano_modelo: ''
        })

    }

    // Obtendo o usuario ativo do contexto de autenticação
    const { user } = useAuth()
    const usuarioAtivo = user?.nome.split('.').toString()
    console.log('Usuário ativo: ', usuarioAtivo)

    // Base URL da API para consulta direta sem passar pelo contexto de hooks
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // buscando os dados do veiculo na tabela veiculo
    const { data: veiculo } = useGetData(buscaPlaca ? `/veiculos/placa/${placa}` : null)

    // Só busca o vendendor se soubermos a loja:
    const { data: dadosVendedor } = useGetData(usuarioAtivo ? `/vendedor/unidade/${encodeURIComponent(usuarioAtivo)}` : null);

    //Busca os dados da liberação na tabela liberação
    const { data: liberacao } = useGetData(buscaPlacaDelete ? `/wow/movimentacoes/placa/${placaDelete}` : null)

    // Enviando dados da liberação
    const { createData } = usePostData('/wow/movimentacoes')

    // Apagando uma liberação
    const { deleteData } = useDeleteId(`/wow/movimentacoes`)

    // Ref para manter a referência atualizada da última placa buscada
    const ultimaPlacaBuscada = useRef('');


    // Função chamada quando o input da placa perde o foco
    const handleBlur = async () => {

        const placaM = placa.trim().toUpperCase();


        if (placaM.length === 7) {

            const lojaVeiculo = await fetch(`${API_BASE_URL}/veiculos/placa/${placaM}`);

            const dados = await lojaVeiculo.json()
            console.log(`Dados do veículo: ${dados}`)

            const mostrarMensagem = () => {
                //Mostra o modal com uma mensagem de alerta caso o veiculo nao pertença a unidade do usuario ativo
                setModal({
                    aberto: true,
                    titulo: "",
                    mensagem: "O veiculo correspondente a essa placa nao pertence a essa unidade. Operação nao permitida.",
                    tipo: "",
                    acao: ""
                });
            }

            if (dados.unidade !== usuarioAtivo) {

                mostrarMensagem()
                resetForm()

            }

            try {

                // Verifica se a placa existe em liberações de acordo com o retorno da busca no beck-end
                const resPlaca = await fetch(`${API_BASE_URL}/wow/movimentacoes/placa/${placaM}`);

                const mostrarMensagem = () => {
                    //Mostra o modal com uma mensagem de alerta caso já exista uma liberação para a placa informada.
                    setModal({
                        aberto: true,
                        titulo: "",
                        mensagem: 'Ja consta uma liberação solicitada para esta placa. Caso deseje solicitar uma nova liberação, cancele a antiga.',
                        tipo: "",
                        acao: ""
                    });
                }

                //caso exista, emite o alerta para o usuario
                if (resPlaca.status === 200) {

                    mostrarMensagem()
                    setMostrarSelect(false);
                    resetForm();

                } else if (resPlaca.status === 404) {

                    // Caso nao exista, Só busca se a placa for diferente da última buscada
                    if (placaM !== ultimaPlacaBuscada.current) {

                        //console.log('Buscando placa:', placaM); // Debug
                        ultimaPlacaBuscada.current = placaM;
                        setBuscaPlaca(placaM);
                    }
                    setMostrarSelect(true);
                }

            } catch (erro) {
                console.error('Erro ao buscar liberação:', erro);
            }
        }
    };

    const handleBlurDelete = async () => {

        const placaDeleteM = placaDelete.trim().toUpperCase();
        if (placaDeleteM.length === 7) {
            const cancelarSaida = await fetch(`${API_BASE_URL}/wow/movimentacoes/placa/${placaDeleteM}`);

            const mostrarMensagem = () => {

                setModal({
                    aberto: true,
                    titulo: "",
                    mensagem: "O veiculo correspondente a essa placa nao pertence a essa unidade. Operação nao permitida.",
                    tipo: "",
                    acao: ""
                });
            }

            const dados = await cancelarSaida.json()
            console.log(`Dados do veículo: ${dados}`)


            if (dados.unidade !== usuarioAtivo) {
                mostrarMensagem()
                resetForm()
            }


            // Só busca se a placa for diferente da última buscada
            if (placaDeleteM !== ultimaPlacaBuscada.current) {
                //console.log('Buscando placa para exclusão:', placaDeleteM); // Debug
                ultimaPlacaBuscada.current = placaDeleteM;
                setBuscaPlacaDelete(placaDeleteM);
            } else setDeleteDados({
                id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
                unidade: '', motivo: '', dataRegistro: '', data_cadastro: '', ano_fabricacao: '', ano_modelo: ''
            });
        }
    }

    // Preencher campos quando os dados solicitados chegarem
    useEffect(() => {
        if (veiculo && !veiculo.erro) {
            console.log('Dados do veículo recebidos:', veiculo); // Debug
            setDadosVeiculo(prev => ({
                ...prev,
                marca: veiculo.marca || '',
                modelo: veiculo.modelo || '',
                cor: veiculo.cor || '',
                renavan: veiculo.renavan || '',
                unidade: veiculo.unidade || '',
                ano_modelo: veiculo.ano_modelo || '',
                ano_fabricacao: veiculo.ano_fabricacao || '',
                data_cadastro: formatDateInfo(veiculo.data_registro),
            }));
        } else if (veiculo && veiculo.erro) {
            console.log('Veículo não encontrado');;
        }

        if (liberacao && !liberacao.erro) {
            console.log('Dados do veículo recebidos:', liberacao); // Debug
            setDeleteDados(prev => ({
                ...prev,
                id: liberacao.id || '',
                unidade: liberacao.unidade || '',
                responsavelMovimentacaoNome: liberacao.responsavelMovimentacaoNome || '',
                tipoMovimentacao: liberacao.tipoMovimentacao || '',
                observacaoMovimentacao: liberacao.observacaoMovimentacao || '',
            }));
        } else if (liberacao && liberacao.erro) {
            console.log('Veículo não encontrado');;
        }

    }, [veiculo, liberacao]);

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
    // Essa função é chamada quando o usuário deseja solicitar a liberação de um veículo
    const handleSubmit = async (e) => {
        e.preventDefault()

        setModal({
            aberto: true,
            titulo: "Confirmação de Solicitação",
            mensagem: "Confirmar a solicitação de liberação do veículo?",
            tipo: "confirmacao",
            acao: confirmarSolicitacao
        });

    }

    const confirmarSolicitacao = async () => {

        let dados = {
            placa, id: veiculo.id, usr_cad: veiculo.audit, chassi: veiculo.chassi, marca: dadosVeiculo.marca, modelo: dadosVeiculo.modelo, cor: dadosVeiculo.cor, renavan: dadosVeiculo.renavan,
            unidade: dadosVeiculo.unidade, data_cadastro: dadosVeiculo.data_cadastro, responsavelMovimentacaoNome: solicitante, solicitante, observacoes,
            motivo: selectedMotivo, observacaoMovimentacao: observacoes, tipoMovimentacao: selectedMotivo,
            ano_fabricacao: veiculo.ano_fabricacao, ano_modelo: dadosVeiculo.ano_modelo, audit: user?.nome
        }

        dados = toUpperFields(dados, ['placa', 'marca', 'modelo', 'cor', 'unidade', 'tipoMovimentacao', 'motivo', 'responsavelMovimentacaoNome', 'observacaoMovimentacao', 'solicitante', 'observacoes'])

        const validarCpf = await fetch(`${API_BASE_URL}/vendedor/nome/${solicitante}`);
        const dadosVendedor = await validarCpf.json()
        console.log(`Dados do veículo: ${dadosVendedor}`)


        if (dadosVendedor.cpf !== confirmaCpf) {

            const mostrarMensagem = () => {
                setModal({
                    aberto: true,
                    titulo: "",
                    mensagem: "O cpf informado nao correspode ao do vendedor selecionado. Operação nao permitida.",
                    tipo: "",
                    acao: ""
                });
            }

            mostrarMensagem()
            resetForm()
        } else {

            try {

                if (selectedMotivo === 'VENDA' || selectedMotivo === 'DEVOLUCAO' || selectedMotivo === 'TRANSFERENCIA') {

                    const resMovimentacao = await fetch(`${API_BASE_URL}/solicitacoes/placa/${placa}`);

                    const mostrarMensagem = () => {
                        setModal({
                            aberto: true,
                            titulo: "",
                            mensagem: `Não há registro de ${selectedMotivo} no sistema para o esse veículo. Registre a ${selectedMotivo} antes de solicitar a liberação.`,
                            tipo: "",
                            acao: ""
                        });
                    }

                    if (resMovimentacao.status !== 200) {

                        mostrarMensagem()
                        resetForm()

                    } else {
                        await createData(dados)
                        /* Enviar mensagem via WhatsApp
                        const mensagem = `Prezados, favor realizar a liberação do seguinte veiculo:\nLoja: ${veiculo.unidade}\nMarca: ${veiculo.marca}\nModelo: ${veiculo.modelo}
                         \nCor: ${veiculo.cor}\nPlaca: ${placa}\nMotivo: ${selectedMotivo}\nObservação: ${observacoes}\nDesde já agradeço.`
                        const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
                        window.open(urlWhatsApp, '_blank')*/

                        const mostrarMensagem = () => {
                            setModal({
                                aberto: true,
                                titulo: "",
                                mensagem: `Solicitação de liberação registrada.`,
                                tipo: "",
                                acao: ""
                            });
                        }

                        mostrarMensagem()
                        resetForm()
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                    }
                }
            } catch {

                const mostrarMensagem = () => {
                    setModal({
                        aberto: true,
                        titulo: "",
                        mensagem: `Falha ao realizar a liberação.\nEntre em contato com o suporte.`,
                        tipo: "",
                        acao: ""
                    });
                }
                mostrarMensagem()
                resetForm()
            }
        }
    }


    //Função para lidar com o cancelamento de uma solicitação de liberação
    const handleDelete = async (e) => {
        e.preventDefault()

        setModal({
            aberto: true,
            titulo: "Confirmação de Cancelamento",
            mensagem: "Confirma o cancelamento da solicitação de liberação do veículo?",
            tipo: "confirmacao",
            acao: confirmarCancelamento
        });

    }

    const confirmarCancelamento = async () => {

        let idVeiculo = liberacao.id

        try {
            const mostrarMensagem = async () => {

                await deleteData(idVeiculo)

                setModal({
                    aberto: true,
                    titulo: "",
                    mensagem: "Liberação cancelada.",
                    tipo: "",
                    acao: ""
                });
            }

            mostrarMensagem()
            fecharModal()
            resetForm()
            window.scrollTo({ top: 0, behavior: 'smooth' })
        } catch (err) {

            const mostrarMensagem = () => {
                setModal({
                    aberto: true,
                    titulo: "",
                    mensagem: "Não foi possivel cancelar a solicitação de liberação.\nEntre em contato com o suporte.",
                    tipo: "",
                    acao: ""
                });
            }
            console.error('Falha ao cancelar a liberação do veiculo: ', err)
            mostrarMensagem()
            fecharModal()
            resetForm()
        }
    }


    // Função para lidar com a seleçao de vendedor
    const handleVendedorChange = (e) => {
        const selectedOption = e.target.selectedOptions[0]
        const nome = selectedOption.getAttribute('data-descricao')
        setSolicitante(nome)
    }

    const fecharModal = () => {
        setModal(prev => ({
            ...prev,
            aberto: false
        }));
    };

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
                        <a className="link_a" href="/lojista">Lojista</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <p className='atual'>Solicitar Liberação </p>
                    </div>
                </div>
            </div>
            <div className="container d-flex justify-content-center card-container">
                <Box onSubmit={handleSubmit}>
                    <div className='panel-heading'>
                        <i className='ti ti-new-window' id="ti-black" ></i>
                        <p>SOLICITAR A LIBERAÇÃO DE UM VEÍCULO <br /> Informe a placa do veículo para obter os demais dados</p>
                    </div>
                    <Form >
                        <div className="col-12 col-md-2">
                            <Input label={"Placa:"} type={"text"} maxLength={"7"} style={{ width: '85px' }} nameInput={"placa"}
                                value={placa} onChange={(e) => setPlaca(e.target.value)} onBlur={handleBlur} required />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Loja:"} type={"text"} style={{ width: '150px' }} nameInput={"unidade"} value={dadosVeiculo.unidade} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Marca:"} type={"text"} style={{ width: '150px' }} nameInput={"marca"} value={dadosVeiculo.marca} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Modelo:"} type={"text"} style={{ width: '150px' }} nameInput={"modelo"} value={dadosVeiculo.modelo} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Cor:"} type={"text"} style={{ width: '150px' }} nameInput={"cor"} value={dadosVeiculo.cor} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Renavam:"} type={"text"} style={{ width: '150px' }} nameInput={"renavam"} value={dadosVeiculo.renavan} readOnly />
                        </div>
                        {mostrarSelect && (
                            <>
                                <div className='col-12 col-md-3' id='select-all'>
                                    <label className="label" id="select-label"><span>Motivo:</span></label>
                                    <select type='text' name="motivo" value={selectedMotivo} onChange={(e) => setSelectedMotivo(e.target.value)} className="select-item" required>
                                        <option value="">INFORME UM MOTIVO</option>
                                        <option value="VENDA" >VENDA</option>
                                        <option value="DEVOLUCAO" >DEVOLUÇÃO</option>
                                        <option value="TRANSFERENCIA" >TRANSFERÊNCIA</option>
                                        <option value="MANUTENCAO" >MANUTENÇÃO</option>
                                        <option value="TESTE_DRIVE" >TESTE DRIVE</option>
                                    </select>
                                </div>
                                <div className='col-12 col-md-6' id='select-all'>
                                    <label className="label" id="select-label"><span>Solicitante:</span></label>
                                    <select type='text' name='loja' value={solicitante} onChange={handleVendedorChange} className="select-item" style={{ width: '250px' }} required >
                                        <option value="" >SELECIONE UM VENDEDOR</option>
                                        {dadosVendedor.map((vendedores) => (
                                            <option key={vendedores.nome} value={vendedores.nome} data-descricao={vendedores.nome}>
                                                {vendedores.nome}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-6 col-md-6">
                                    <Input label={"CPF do Solicitante:"} type={"text"} style={{ width: '150px' }} maxLength={14}
                                        nameInput={"modelo"} value={confirmaCpf} onChange={(e) => setConfirmaCpf(formatCPF(e.target.value))} placeholder={"XXX.XXX.XXX-XX"} required />
                                </div>
                                <div className="col-12 col-md-6">
                                    <Input label={"Observação:"} type={"text"} style={{ width: '300px' }} nameInput={"observacoes"}
                                        value={observacoes} onChange={(e) => setObservacoes(e.target.value)} />
                                    <Input type={"hidden"} style={{ width: '300px' }} value={dadosVeiculo.data_cadastro} readOnly />
                                </div>
                            </>
                        )}
                        <div className="d-flex flex-row-reverse">
                            <Button onClick={handleSubmit} variant='primary' >ENVIAR</Button>
                        </div>
                    </Form>
                    <hr />
                    <div className='panel-heading'>
                        <i className='ti ti-close' id="ti-black" ></i>
                        <p>CANCELAR UMA SOLICITAÇÃO DE LIBERAÇÃO <br /> Informe a placa do veículo para obter os dados da liberaçao</p>
                    </div>
                    <Form>
                        <div className="col-12 col-md-2">
                            <Input label={"Placa:"} type={"text"} maxLength={"7"} style={{ width: '85px' }} nameInput={"placa"}
                                value={placaDelete} onChange={(e) => setPlacaDelete(e.target.value)}
                                onBlur={handleBlurDelete} required />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Motivo:"} type={"text"} style={{ width: '150px' }} nameInput={"tipoMovimentacao"} value={deleteDados.tipoMovimentacao} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Solicitante:"} type={"text"} style={{ width: '150px' }} nameInput={"responsavelMovimentacaoNome"} value={deleteDados.responsavelMovimentacaoNome} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Observacao:"} type={"text"} style={{ width: '150px' }} nameInput={"observacaoMovimentacao"} value={deleteDados.observacaoMovimentacao} readOnly />
                        </div>
                        <div className="d-flex flex-row-reverse">
                            <Button onClick={handleDelete} variant='danger' >CANCELAR </Button>
                        </div>
                    </Form>
                </Box>
                <>
                    <ModalBootstrap modal={modal} fecharModal={fecharModal} id="modal" />
                </>
            </div>
        </ContainerSecundario>
    )
}

export default SolicitarLiberacao
