import ContainerSecundario from '../../../components/container/ContainerSecundario'
import Box from '../../../components/box/Box';
import Input from '../../../components/input/Input';
import Form from '../../../components/form/Form';
import Button from '../../../components/button/Button';

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
    const [deleteDados, setDeleteDados] = useState({
        id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
        unidade: '', motivo: '', dataRegistro: '', data_cadastro: ''
    })
    const [dadosVeiculo, setDadosVeiculo] = useState({
        id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
        unidade: '', motivo: '', dataRegistro: '', data_cadastro: ''
    })

    const resetForm = () => {
        setPlaca('')
        setPlacaDelete('')
        setSelectedMotivo('')
        setConfirmaCpf('')
        setMostrarSelect(false)
        setDeleteDados({
            id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
            unidade: '', motivo: '', dataRegistro: '', data_cadastro: '', ano_fabricacao: '', ano_modelo: ''
        })
        setDadosVeiculo({
            id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
            unidade: '', motivo: '', dataRegistro: '', data_cadastro: '', ano_fabricacao: '', ano_modelo: ''
        })

    }

    const { user } = useAuth()
    const usuarioAtivo = user?.nome.split('.').toString()
    console.log('Usuário ativo: ', usuarioAtivo)

    // buscando os dados do veiculo na tabela veiculo
    const { data: veiculo } = useGetData(buscaPlaca ? `/veiculos/placa/${placa}` : null)

    // Só busca o vendendor se soubermos a loja:
    const { data: dadosVendedor } = useGetData(usuarioAtivo ? `/vendedor/unidade/${encodeURIComponent(usuarioAtivo)}` : null);

    //Busca os dados da liberação na tabela liberação
    const { data: liberacao } = useGetData(buscaPlacaDelete ? `/wow/movimentacoes/placa/${placaDelete}` : null)
    console.log('Dados da liberação: ', liberacao)

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

            if (dados.unidade !== usuarioAtivo) {
                window.alert("O veiculo correspondente a essa placa nao pertence a essa unidade. Operação nao permitida.")
                window.location.reload()
            }
            try {

                // Verifica se a placa existe em liberações de acordo com o retorno da busca no beck-end
                const resPlaca = await fetch(`${API_BASE_URL}/wow/movimentacoes/placa/${placaM}`);

                //caso exista, emite o alerta para o usuario
                if (resPlaca.status === 200) {

                    window.alert('Ja consta uma liberação solicitada para esta placa. Caso deseje solicitar uma nova liberação, cancele a antiga.');
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

        const cancelarSaida = await fetch(`${API_BASE_URL}/wow/movimentacoes/placa/${placaDeleteM}`);

        const dados = await cancelarSaida.json()
        console.log(`Dados do veículo: ${dados}`)

        if (dados.unidade !== usuarioAtivo) {
            window.alert("O veiculo correspondente a essa solicitação nao pertence a essa unidade. Operação nao permitida.")
            window.location.reload()
        }

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

        const validarCpf = await fetch(`${API_BASE_URL}/vendedor/nome/${solicitante}`);
        const dadosVendedor = await validarCpf.json()
        console.log(`Dados do veículo: ${dadosVendedor}`)

        if (dadosVendedor.cpf !== confirmaCpf) {

            window.alert("O cpf informado nao correspode ao do vendedor selecionado. Operação nao permitida.")
            return
        }

        let dados = {
            placa, id: veiculo.id, usr_cad: veiculo.audit, chassi: veiculo.chassi, marca: dadosVeiculo.marca, modelo: dadosVeiculo.modelo, cor: dadosVeiculo.cor, renavan: dadosVeiculo.renavan,
            unidade: dadosVeiculo.unidade, data_cadastro: dadosVeiculo.data_cadastro, responsavelMovimentacaoNome: solicitante, solicitante, observacoes,
            motivo: selectedMotivo, observacaoMovimentacao: observacoes, tipoMovimentacao: selectedMotivo,
            ano_fabricacao: veiculo.ano_fabricacao, ano_modelo: dadosVeiculo.ano_modelo, audit: user?.nome

        }

        dados = toUpperFields(dados, ['placa', 'marca', 'modelo', 'cor', 'unidade', 'tipoMovimentacao', 'motivo', 'responsavelMovimentacaoNome', 'observacaoMovimentacao', 'solicitante', 'observacoes'])
        // Padroniza para caixa alta
        console.log('Dados a serem enviados: ', dados)

        //Verificando se existe um registro de Venda, Transferencia ou Devolução. Caso nao haja, a operação nao e permitida
        if (selectedMotivo === 'VENDA' || selectedMotivo === 'DEVOLUCAO' || selectedMotivo === 'TRANSFERENCIA') {

            const resMovimentacao = await fetch(`${API_BASE_URL}/solicitacoes/placa/${placa}`);

            if (resMovimentacao.status !== 200) {

                window.alert(`Não há registro de ${selectedMotivo} no sistema para o esse veículo. Registre a ${selectedMotivo} antes de solicitar a liberação.`);
                window.location.reload()
                return
            }

        }

        const confirmar = window.confirm("Confirmar a solicitação de liberação do veículo? ");
        if (confirmar === true) {
            try {

                const resultado = await createData(dados)
                /* Enviar mensagem via WhatsApp
                const mensagem = `Prezados, favor realizar a liberação do seguinte veiculo:\nLoja: ${veiculo.unidade}\nMarca: ${veiculo.marca}\nModelo: ${veiculo.modelo}
                 \nCor: ${veiculo.cor}\nPlaca: ${placa}\nMotivo: ${selectedMotivo}\nObservação: ${observacoes}\nDesde já agradeço.`
                const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
                window.open(urlWhatsApp, '_blank')*/

                console.log('Liberação solicitada., ', resultado)
                window.alert('Liberação solicitada.')
                resetForm()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } catch (err) {
                console.error('Falha ao registrar a liberação: ', err)
                window.alert('Falha ao realizar a liberação.\nEntre em contato com o suporte')
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
                resetForm()
                window.scrollTo({ top: 0, behavior: 'smooth' })
            } catch (err) {
                console.error('Falha ao cancelar a liberação do veiculo: ', err)
                window.alert("Não foi possivel cancelar a solicitação de liberação.\nEntre em contato com o suporte.")
            }
        }
    }

    // Função para lidar com a seleçao de vendedor
    const handleVendedorChange = (e) => {
        const selectedOption = e.target.selectedOptions[0]
        const nome = selectedOption.getAttribute('data-descricao')
        setSolicitante(nome)
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
                                    <select type='text' name='loja' value={solicitante} onChange={handleVendedorChange} className="select-item" style={{ width: '350px' }} required >
                                        <option value="" >SELECIONE UM VENDEDOR CADASTRADO</option>
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
                                value={placaDelete} onChange={(e) => setPlacaDelete(e.target.value)} onBlur={handleBlurDelete} required />
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
                            <Button onClick={handleDelete} variant='danger' >CANCELAR LIBERAÇÃO</Button>
                        </div>
                    </Form>
                </Box>
            </div>

        </ContainerSecundario>
    )
}

export default SolicitarLiberacao
