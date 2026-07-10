import ContainerSecundario from '../../../components/container/ContainerSecundario'
import Box from '../../../components/box/Box';
import Input from '../../../components/input/Input';
import Form from '../../../components/form/Form';
import Button from '../../../components/button/Button';

import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"

import { formatDateInfo } from '../../../hooks/formatDate';
import { useState, useEffect, useRef } from "react";
import { useGetData } from '../../../services/useGetData';
import { usePostData } from '../../../services/usePostData';
import { useDeleteId } from '../../../services/useDeleteId';

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

    // buscando os dados no bd
    const { data: veiculo } = useGetData(buscaPlaca ? `/veiculos/placa/${placa}` : null)

    const { data: liberacao } = useGetData(buscaPlacaDelete ? `/liberacoes/placa/${placaDelete}` : null)

    // Enviando dados editados
    const { createData } = usePostData('/liberacoes')

    const { deleteData } = useDeleteId(`/liberacoes`)

    // Base URL da API
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


    // Ref para manter a referência atualizada da última placa buscada
    const ultimaPlacaBuscada = useRef('');

    // Função chamada quando o input da placa perde o foco
    const handleBlur = async () => {

        const placaM = placa.trim().toUpperCase();

        if (placaM.length === 7) {

            try {
                // Verifica se a placa existe em liberações
                const resPlaca = await fetch(`${API_BASE_URL}/liberacoes/placa/${placaM}`);

                //caso exista, emite o alerta para o usuario
                if (resPlaca.status === 200) {

                    window.alert('Ja consta uma liberação solicitada para esta placa. Caso deseje solicitar uma nova liberação, cancele a antiga.');
                    setMostrarSelect(false);
                    setDadosVeiculo({
                        id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
                        unidade: '', motivo: '', dataRegistro: '', data_cadastro: '', ano_fabricacao: '', ano_modelo: ''
                    });
                    setSelectedMotivo('');
                    setSolicitante('');
                    setObservacoes('');
                } else if (resPlaca.status === 404) {

                    // Caso nao exist, Só busca se a placa for diferente da última buscada
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

    const handleBlurDelete = () => {
        const placaDeleteM = placaDelete.trim().toUpperCase();
        if (placaDeleteM.length === 7) {
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
                marca: liberacao.marca || '',
                modelo: liberacao.modelo || '',
                cor: liberacao.cor || '',
                renavan: liberacao.renavan || '',
                unidade: liberacao.unidade || '',
                solicitante: liberacao.solicitante || '',
                motivo: liberacao.motivo || '',
                observacoes: liberacao.observacoes || '',
                data_cadastro: formatDateInfo(liberacao.data_registro),


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

        let dados = {
            placa, id: veiculo.id, marca: dadosVeiculo.marca, modelo: dadosVeiculo.modelo, cor: dadosVeiculo.cor, renavan: dadosVeiculo.renavan,
            unidade: dadosVeiculo.unidade, data_cadastro: dadosVeiculo.data_cadastro, solicitante, observacoes, motivo: selectedMotivo,
            ano_fabricacao: veiculo.ano_fabricacao, ano_modelo: dadosVeiculo.ano_modelo

        }

        dados = toUpperFields(dados, ['placa', 'marca', 'modelo', 'cor', 'unidade', 'motivo', 'solicitante', 'observacoes'])
        // Padroniza para caixa alta
        console.log('Dados a serem enviados: ', dados)

        const confirmar = window.confirm("Confirmar a solicitação de liberação do veículo? \nEm caso de liberção por devolução," +
            "transferência ou venda, a baixa automática do veículo será efetuada às 23:45 de hoje.");

        if (confirmar && dadosVeiculo.marca === "" || dadosVeiculo.modelo === "" || dadosVeiculo.cor === "" ||
            dadosVeiculo.unidade === "" || dadosVeiculo.motivo === "" || solicitante === "", observacoes === "") {
            window.alert("Por favor, verifique o formulario novamente Todos os campos precisam ser preenchidos.")
        } else {
            try {
                const resultado = await createData(dados)

                // Enviar mensagem via WhatsApp
                const mensagem = `Prezados, favor realizar a liberação do seguinte veiculo:\nLoja: *${veiculo.unidade}*\nPlaca: *${placa}*\nMarca: ${veiculo.marca}\nModelo: ${veiculo.modelo}\nCor: ${veiculo.cor}\nMotivo: ${selectedMotivo}\nObservação: ${observacoes}\nDesde já agradeço.`
                const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
                window.open(urlWhatsApp, '_blank')

                console.log('Liberação solicitada., ', resultado)
                window.alert('Liberação solicitada.')
                window.location.reload()
            } catch (err) {
                console.error('Falha ao registrar o veiculo: ', err)
                window.alert('Falha ao registrar o veículo. Entre em contato com suporte.')
            }
        }
    }

    // Funçao para deletar a liberação
    // Essa função é chamada quando o usuário deseja cancelar a liberação de um veículo
    const handleDelete = async (e) => {
        e.preventDefault()

        let idVeiculo = liberacao.id

        console.log('ID a ser deletado: ', idVeiculo)
        const confirmar = window.confirm("Confirmar o cancelamento da solicitação de liberação do veículo?");

        if (confirmar === true) {
            try {
                const resultado = await deleteData(idVeiculo)


                console.log('Liberação cancelada.', resultado)
                window.alert('Liberação cancelada.')
                window.location.reload()
            } catch (err) {
                console.error('Falha ao cancelar a liberação do veiculo: ', err)
                window.alert('Falha ao cancelar a liberação do veículo.\nEntre em contato com o suporte.')
            }
        }
    }

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
                            o veículo terá a sua baixa automática realizada às 23:45 do mesmo dia da solicitação.</p>
                    </div>
                    <br />
                    <br />
                    <br />
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
                                value={placaDelete} onChange={(e) => setPlacaDelete(e.target.value)} onBlur={handleBlurDelete} required />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Loja:"} type={"text"} style={{ width: '150px' }} nameInput={"unidade"} value={deleteDados.unidade} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Marca:"} type={"text"} style={{ width: '150px' }} nameInput={"marca"} value={deleteDados.marca} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Modelo:"} type={"text"} style={{ width: '150px' }} nameInput={"modelo"} value={deleteDados.modelo} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Cor:"} type={"text"} style={{ width: '150px' }} nameInput={"cor"} value={deleteDados.cor} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Renavam:"} type={"text"} style={{ width: '150px' }} nameInput={"renavam"} value={deleteDados.renavan} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Solicitante:"} type={"text"} style={{ width: '150px' }} nameInput={"solicitante"} value={deleteDados.solicitante} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Motivo:"} type={"text"} style={{ width: '150px' }} nameInput={"motivo"} value={deleteDados.motivo} readOnly />
                        </div>
                        <div className="d-flex flex-row-reverse">
                            <Button onClick={handleDelete} variant='primary' >ENVIAR</Button>
                        </div>
                    </Form>
                </Box>

            </div>
        </ContainerSecundario>
    )
}

export default LiberarVeiculo
