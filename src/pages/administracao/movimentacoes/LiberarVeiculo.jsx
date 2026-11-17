
import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import ContainerSecundario from '../../../components/container/ContainerSecundario'
import Box from '../../../components/box/Box';
import Input from '../../../components/input/Input';
import Form from '../../../components/form/Form';
import Button from '../../../components/button/Button';
import ModalBootstrap from '../../../components/modal/ModalBootstrap';

import { formatDateInfo } from '../../../hooks/formatDate';
import { useState, useEffect, useRef } from "react";
import { useGetData } from '../../../services/useGetData';
import { usePostData } from '../../../services/usePostData';
import { useDeleteId } from '../../../services/useDeleteId';
import { useAuth } from '../../../hooks/useAuth';

const LiberarVeiculo = () => {
    const [placa, setPlaca] = useState('')
    const [placaDelete, setPlacaDelete] = useState('')
    const [solicitante, setSolicitante] = useState('')
    const [observacoes, setObservacoes] = useState('')
    const [buscaPlaca, setBuscaPlaca] = useState("")
    const [buscaPlacaDelete, setBuscaPlacaDelete] = useState("")
    const [selectedMotivo, setSelectedMotivo] = useState('')
    const [mostrarSelect, setMostrarSelect] = useState(false)
    const [deleteDados, setDeleteDados] = useState({
        id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
        unidade: '', motivo: '', dataRegistro: '', data_cadastro: ''
    })
    const [dadosVeiculo, setDadosVeiculo] = useState({
        id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
        unidade: '', motivo: '', dataRegistro: '', data_cadastro: ''
    })
    const [modal, setModal] = useState({
        aberto: false,
        titulo: "Atenção",
        mensagem: "",
        tipo: "mensagem",
        acao: null,
    });

    const resetForm = () => {
        setDadosVeiculo({
            id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
            unidade: '', motivo: '', dataRegistro: '', data_cadastro: '', ano_fabricacao: '', ano_modelo: ''
        })

        setDeleteDados({
            id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
            unidade: '', motivo: '', dataRegistro: '', data_cadastro: '', ano_fabricacao: '', ano_modelo: ''
        })

        setSelectedMotivo('')
        setSolicitante('')
        setObservacoes('')
    }

    const { user } = useAuth()

    // buscando os dados do veiculo na tabela veiculo
    const { data: veiculo } = useGetData(buscaPlaca ? `/veiculos/placa/${placa}` : null)

    //Busca os dados da liberação na tabela liberação para excluir a liberação
    const { data: liberacao } = useGetData(buscaPlacaDelete ? `/wow/movimentacoes/placa/${placaDelete}` : null)

    // Enviando dados da liberação
    const { createData } = usePostData('/wow/movimentacoes')

    // Apagando uma liberação
    const { deleteData } = useDeleteId(`/wow/movimentacoes`)

    // Base URL da API
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // Ref para manter a referência atualizada da última placa buscada
    const ultimaPlacaBuscada = useRef('');

    // Função chamada quando o input da placa perde o foco
    const handleBlur = async () => {

        const placaM = placa.trim().toUpperCase();

        if (placaM.length === 7) {

            const lojaVeiculo = await fetch(`${API_BASE_URL}/veiculos/placa/${placaM}`);

            const dados = await lojaVeiculo.json()
            console.log(`Dados do veículo: ${dados}`)

            try {

                // Verifica se a placa existe em liberações de acordo com o retorno da busca no beck-end
                const resPlaca = await fetch(`${API_BASE_URL}/wow/movimentacoes/placa/${placaM}`);

                const verificarRegistro = (titulo, mensagem, aoFechar = null) => {
                    setModal({
                        aberto: true,
                        titulo,
                        mensagem,
                        tipo: "mensagem",
                        acao: "",
                        aoFechar
                    });
                }

                //caso exista, emite o alerta para o usuario
                if (resPlaca.status === 200) {

                    verificarRegistro("Atenção!", "Ja consta uma liberação solicitada para esta placa. Caso deseje solicitar uma nova liberação, cancele a antiga.", resetForm)
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

            } catch {
                window.alert('Erro ao consultar liberação: entre em contato com o suporte.');
            }
        }
    };


    const handleBlurDelete = () => {
        const placaDeleteM = placaDelete.trim().toUpperCase();
        if (placaDeleteM.length === 7) {
            // Só busca se a placa for diferente da última buscada
            if (placaDeleteM !== ultimaPlacaBuscada.current) {
                //console.log('Buscando placa para exclusão:', placaDeleteM); // Debug
                ultimaPlacaBuscada.current = placaDeleteM;
                setBuscaPlacaDelete(placaDeleteM);
            } else {
                resetForm()
            };
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
        e.preventDefault();

        setModal({
            aberto: true,
            titulo: "Confirmação de Liberação",
            mensagem: `Confirmar a liberação do veiculo por motivo de ${selectedMotivo}?`,
            tipo: "confirmacao",
            acao: confirmarLiberacao
        });
    }

    const confirmarLiberacao = async () => {

        let dados = {
            placa, id: veiculo.id, usr_cad: veiculo.audit, chassi: veiculo.chassi, marca: dadosVeiculo.marca,
            modelo: dadosVeiculo.modelo, cor: dadosVeiculo.cor, renavan: dadosVeiculo.renavan,
            unidade: dadosVeiculo.unidade, data_cadastro: dadosVeiculo.data_cadastro, responsavelMovimentacaoNome: solicitante, solicitante, observacoes,
            motivo: selectedMotivo, observacaoMovimentacao: observacoes, tipoMovimentacao: selectedMotivo,
            ano_fabricacao: veiculo.ano_fabricacao, ano_modelo: dadosVeiculo.ano_modelo, audit: user?.nome
        }

        dados = toUpperFields(dados, ['placa', 'marca', 'modelo', 'cor', 'unidade', 'tipoMovimentacao',
            'motivo', 'responsavelMovimentacaoNome', 'observacaoMovimentacao', 'solicitante', 'observacoes'
        ])

        const validacaoCampos = (titulo, mensagem, aoFechar = null) => {
            setModal({
                aberto: true,
                titulo,
                mensagem,
                tipo: "mensagem",
                acao: "",
                aoFechar
            });
        }

        if (dadosVeiculo.marca === "" || dadosVeiculo.modelo === "" || dadosVeiculo.cor === "" ||
            dadosVeiculo.unidade === "" || dadosVeiculo.motivo === "" || solicitante === "", observacoes === "") {
            validacaoCampos("Atencao", "Por favor, verifique o formulario novamente. Todos os campos precisam ser preenchidos.", resetForm)
            return
        } else {
            try {
                await createData(dados)

                // Enviar mensagem via WhatsApp
                /*const mensagem = `Prezados, favor realizar a liberação do seguinte veiculo:\nLoja: *${veiculo.unidade}*\nPlaca: *${placa}*\nMarca: ${veiculo.marca}\nModelo: ${veiculo.modelo}\nCor: ${veiculo.cor}\nMotivo: ${selectedMotivo}\nObservação: ${observacoes}\nDesde já agradeço.`
                const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
                window.open(urlWhatsApp, '_blank')*/

                validacaoCampos("Sucesso!", `Liberação por motivo de ${selectedMotivo} realizada.`, resetForm)
            } catch {
                validacaoCampos("Atenção!", 'Falha ao registrar o veículo. Entre em contato com suporte.', resetForm)
            }
        }
    }

    // Funçao para deletar a liberação
    // Essa função é chamada quando o usuário deseja cancelar a liberação de um veículo
    const handleDelete = async (e) => {
        e.preventDefault()

        setModal({
            aberto: true,
            titulo: "Confirmação de Cancelamento",
            mensagem: `Confirmar o cancelamento da solicitação de liberação por ${liberacao.motivo}?`,
            tipo: "confirmacao",
            acao: confirmarCancelamento
        });
    }

    const confirmarCancelamento = async () => {

        const alertaAcao = (titulo, mensagem, aoFechar = null) => {
            setModal({
                aberto: true,
                titulo,
                mensagem,
                tipo: "mensagem",
                acao: "",
                aoFechar
            });
        }

        let idVeiculo = liberacao.id
        try {
            await deleteData(idVeiculo)
            alertaAcao("Sucesso", `Cancelamento confirmado. Favor verificar se o veiculo ainda se encontra em estoque.\n Caso não esteja, devera ser recadastrado`)

        } catch (err) {
            console.error('Falha ao cancelar a liberação do veiculo: ', err)
            alertaAcao("", 'Falha ao cancelar a liberação do veículo.\nEntre em contato com o suporte.')
        }
    }

    //Função que fecha o modal
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
                        <a className="link_a" href="\administracao">Administração</a>
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

                    {/*
                    <br />
                    <br />
                    <br />
                   <div className="position-absolute top-25 start-50 translate-middle" id="alerta">
                        <div className="position-absolute top-25 start-50 translate-middle" >
                            <p><img src="./icons8-erro.gif" alt="alerta" /> ATENÇÃO!</p>
                        </div>
                        <div className="position-absolute top-25 start-50 translate-middle" >
                        </div>
                        <p><br />Em caso de solicitação de liberação por <strong>venda</strong> , <strong>devolução</strong> ou <strong>transferência</strong>,
                            o veículo terá a sua baixa automática realizada assim que passar pela cancela de saída. Caso realize o cancelamento da 
                            liberação apos o veículo sair, ele deverá ser recadastrado.</p>
                    </div>
                    <br />
                    <br />
                    <br />
                    */}

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
                                        <option value="CORRECAO" >CORREÇÃO DE ESTOQUE</option>
                                    </select>
                                </div>
                                <div className="col-12 col-md-3">
                                    <Input label={"Solicitante:"} type={"text"} style={{ width: '150px' }} nameInput={"solicitante"}
                                        value={solicitante} onChange={(e) => setSolicitante(e.target.value)} />
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
                        <p>CANCELAR UMA SOLICITAÇÃO DE LIBERAÇÃO <br /> Informe a placa do veículo para obter os demais dados</p>
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

export default LiberarVeiculo
