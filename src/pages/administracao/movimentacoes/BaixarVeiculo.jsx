import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import ContainerSecundario from '../../../components/container/ContainerSecundario'
import Box from '../../../components/box/Box';
import Input from '../../../components/input/Input';
import Form from '../../../components/form/Form';
import Button from '../../../components/button/Button';
import ModalBootstrap from '../../../components/modal/ModalBootstrap';

import { formatDateInfo, formatTimestamp } from '../../../hooks/formatDate';
import { useState, useRef, useEffect } from "react";
import { useGetData } from '../../../services/useGetData';
import { usePostData } from '../../../services/usePostData';
import { useDeleteData } from '../../../services/useDeleteData';
import { useAuth } from '../../../hooks/useAuth';

const BaixarVeiculo = () => {

    const [placa, setPlaca] = useState('')
    const [dadosLiberacao, setDadosLiberacao] = useState({ id: '', tipoMovimentacao: '' })
    const [buscaLiberacao, setBuscaLiberacao] = useState("")
    const [solicitante, setSolicitante] = useState('')
    const [observacoes, setObservacoes] = useState('')
    const [buscaPlaca, setBuscaPlaca] = useState("")
    const [selectedMotivo, setSelectedMotivo] = useState('')
    const [mostrarSelect, setMostrarSelect] = useState(false)
    const [dadosVeiculo, setDadosVeiculo] = useState({
        id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
        unidade: '', motivo: '', data_cadastro: '', ano_fabricacao: '', ano_modelo: '', dataRegistro: '',
    })
    const [modal, setModal] = useState({
        aberto: false,
        titulo: "Atenção",
        mensagem: "",
        tipo: "mensagem",
        acao: null,
    });

    //Limpa o formulario apos o envio
    const resetForm = () => {
        setDadosVeiculo({
            id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '', unidade: '', motivo: '', data_cadastro: '',
            ano_fabricacao: '', ano_modelo: '', dataRegistro: ''
        });
        setPlaca(''), setSolicitante(''), setObservacoes('')
        ultimaPlacaBuscada.current = ''; // também reseta a ref
    };

    const { user } = useAuth()

    // buscando os dados no bd
    const { data: veiculo } = useGetData(buscaPlaca ? `/veiculos/placa/${placa}` : null)
    console.log(veiculo)

    // Enviando dados editados
    const { createData } = usePostData('/baixas')

    const { deleteData } = useDeleteData(`/veiculos`)

    //Busca os dados da liberação na tabela liberação para excluir a liberação
    const { data: liberacao } = useGetData(buscaLiberacao ? `/wow/movimentacoes/placa/${placa}` : null)

    // Ref para manter a referência atualizada da última placa buscada
    const ultimaPlacaBuscada = useRef('');

    // Função chamada quando o input da placa perde o foco
    const handleBlur = async () => {

        const placaM = placa.trim().toUpperCase();

        if (placaM.length !== 7) return;
        if (placaM === ultimaPlacaBuscada.current) return;

        ultimaPlacaBuscada.current = placaM;

        setBuscaPlaca(placaM);
        setBuscaLiberacao(placaM)

        setMostrarSelect(true);
    };

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

    // Recebendo os dados do veiculo
    useEffect(() => {
        if (veiculo && !veiculo.erro) {
            console.log(veiculo)
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
            }))
        } else if (veiculo && veiculo.erro) {
            console.log('Veículo não encontrado');;
        }

        if (liberacao && !liberacao.erro) {
            console.log('Dados da liberaçao: ', liberacao)
            setDadosLiberacao(prev => ({
                ...prev,
                id: liberacao.id || '',
                tipoMovimentacao: liberacao.tipoMovimentacao

            }))
        } else if (liberacao && liberacao.erro) {
            console.log('Nenhuma liberação encontrada para a placa informada.');;
        }
    }, [veiculo, liberacao])


    const handleSubmit = async (e) => {
        e.preventDefault()

        setModal({
            aberto: true,
            titulo: "Confirmação de Baixa",
            mensagem: `Confirma a baixa do veículo por motivo de ${selectedMotivo}?`,
            tipo: "confirmacao",
            acao: confirmarBaixa
        });
    }

    const confirmarBaixa = async () => {

        const alertasAcoes = (titulo, mensagem, aoFechar = null) => {
            setModal({
                aberto: true,
                titulo,
                mensagem,
                tipo: "mensagem",
                acao: "",
                aoFechar
            });
        }

        const dataRegistro = formatTimestamp(new Date())

        let dados = {
            id: veiculo.id, placa, marca: dadosVeiculo.marca, modelo: dadosVeiculo.modelo, cor: dadosVeiculo.cor, renavan: dadosVeiculo.renavan,
            unidade: dadosVeiculo.unidade, data_cadastro: dadosVeiculo.data_cadastro, solicitante, observacoes, motivo: selectedMotivo,
            ano_fabricacao: veiculo.ano_fabricacao, ano_modelo: dadosVeiculo.ano_modelo, dataRegistro, audit: user?.nome
        }

        dados = toUpperFields(dados, ['placa', 'marca', 'modelo', 'cor', 'unidade', 'motivo', 'solicitante', 'observacoes'])

        if (dadosVeiculo.marca === "" || dadosVeiculo.modelo === "" || dadosVeiculo.cor === "" ||
            dadosVeiculo.unidade === "" || selectedMotivo === "" || solicitante === "") {
            alertasAcoes("Atencao", "Por favor, verifique o formulario novamente. Todos os campos precisam ser preenchidos.")

        } else if (dadosLiberacao.tipoMovimentacao === 'VENDA' || dadosLiberacao.tipoMovimentacao === 'DEVOLUCAO' || dadosLiberacao.tipoMovimentacao === "TRANSFERENCIA") {
            alertasAcoes('Atenção!', `O veículo informado possui uma liberação por ${dadosLiberacao.tipoMovimentacao} em aberto.\n
                Antes de realizar a baixa, cancele a liberação.`, resetForm)
            return
        } else {

            try {
                await createData(dados)
                await deleteData(placa)
                alertasAcoes("Sucesso", 'Baixa realizada com sucesso', resetForm)
                return
            } catch {
                alertasAcoes("Atenção!", 'Falha ao registrar o veículo. Entre em contato com suporte.', resetForm)
                return
            }
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
                        <a className="link_a" href="/administracao">Administração</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <p className='atual'>Baixar Veículo </p>
                    </div>
                </div>
            </div>
            <div className="container d-flex justify-content-center card-container">
                <Box>
                    <div className='panel-heading'>
                        <i className='ti ti-close' id="ti-black" ></i>
                        <p>REALIZAR A BAIXA DE UM VEÍCULO <br /> Informe a placa do veículo para obter os demais dados</p>
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
                            <Input label={"Ano Fabricacao:"} type={"text"} style={{ width: '50px' }} nameInput={"ano_fabricacao"} value={dadosVeiculo.ano_fabricacao} required readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Ano Modelo:"} type={"text"} style={{ width: '50px' }} nameInput={"ano_modelo"} value={dadosVeiculo.ano_modelo} required readOnly />
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
                            <Button onClick={handleSubmit} variant='primary' >SALVAR</Button>
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

export default BaixarVeiculo
