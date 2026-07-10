import ContainerSecundario from '../../../components/container/ContainerSecundario'
import Box from '../../../components/box/Box';
import Input from '../../../components/input/Input';
import Form from '../../../components/form/Form';
import Button from '../../../components/button/Button';

import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"

import { formatDateInfo, formatTimestamp } from '../../../hooks/formatDate';
import { useState, useRef } from "react";
import { useGetData } from '../../../services/useGetData';
import { usePostData } from '../../../services/usePostData';
import { useDeleteData } from '../../../services/useDeleteData';


const BaixarVeiculo = () => {

    const [placa, setPlaca] = useState('')
    const [solicitante, setSolicitante] = useState('')
    const [observacoes, setObservacoes] = useState('')
    const [buscaPlaca, setBuscaPlaca] = useState("")
    const [selectedMotivo, setSelectedMotivo] = useState('')
    const [mostrarSelect, setMostrarSelect] = useState(false)
    const [dadosVeiculo, setDadosVeiculo] = useState({
        id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
        unidade: '', motivo: '', data_cadastro: '', ano_fabricacao: '', ano_modelo: '', dataRegistro: '',
    })

    //Limpa o formulario apos o envio
    const resetForm = () => {
        setDadosVeiculo({ placa: '', marca: '', modelo: '', cor: '', renavam: '', unidade: '' });
        setPlaca(''), setSolicitante(''), setObservacoes('')
        ultimaPlacaBuscada.current = ''; // também reseta a ref
    };

    // Base URL da API
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    // buscando os dados no bd
    const { data: veiculo, } = useGetData(buscaPlaca ? `/veiculos/placa/${placa}` : null)


    // Enviando dados editados
    const { createData } = usePostData('/baixas')

    const { deleteData } = useDeleteData(`/veiculos`)

    // Ref para manter a referência atualizada da última placa buscada
    const ultimaPlacaBuscada = useRef('');

    // Função chamada quando o input da placa perde o foco
    const handleBlur = async () => {
        const placaM = placa.trim().toUpperCase();

        if (placaM.length !== 7) return;
        if (placaM === ultimaPlacaBuscada.current) return;

        ultimaPlacaBuscada.current = placaM;

        try {
            // 1. Verifica se a placa existe em liberações
            const resLiberacoes = await fetch(`${API_BASE_URL}/liberacoes/placa/${placaM}`);

            let temBloqueio = false;
            console.log(temBloqueio)

            if (resLiberacoes.status === 200) {
                const data = await resLiberacoes.json();
                const tipoLiberacao = data.motivo;

                const bloqueios = ['DEVOLUCAO', 'TRANSFERENCIA', 'VENDA', 'TROCA'];

                if (bloqueios.includes(tipoLiberacao)) {
                    window.alert(
                        'Este veículo possui uma liberação com baixa agendada e não pode ser baixado manualmente. ' +
                        'Realize o cancelamento da liberação antes de proceder com a baixa.'
                    );

                    setDadosVeiculo({
                        id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '', unidade: '', motivo: '', data_cadastro: '',
                        ano_fabricacao: '', ano_modelo: '', dataRegistro: ''
                    });

                    setBuscaPlaca(placaM);
                    return; // Interrompe aqui: não deve cadastrar
                }
            }

            // 2. Buscar dados do veículo
            const resVeiculo = await fetch(`${API_BASE_URL}/veiculos/placa/${placaM}`);

            if (resVeiculo.status === 200) {
                const dados = await resVeiculo.json();

                setDadosVeiculo({
                    marca: dados.marca || '',
                    modelo: dados.modelo || '',
                    cor: dados.cor || '',
                    renavan: dados.renavan || '',
                    unidade: dados.unidade || '',
                    ano_modelo: dados.ano_modelo || '',
                    ano_fabricacao: dados.ano_fabricacao || '',
                    data_cadastro: formatDateInfo(dados.data_registro),
                });
                setMostrarSelect(true);
            } else {
                // Veículo não encontrado
                setMostrarSelect(false);
                setDadosVeiculo({
                    id: '', placa: '', marca: '', modelo: '', cor: '', observacoes: '', renavan: '',
                    unidade: '', motivo: '', data_cadastro: '', ano_fabricacao: '', ano_modelo: '', dataRegistro: ''
                });
                setSelectedMotivo('');
                setSolicitante('');
                setObservacoes('');
            }

            setBuscaPlaca(placaM);

        } catch (erro) {
            console.error('Erro ao buscar placa:', erro);
            setBuscaPlaca(placaM);
        }
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


    const handleSubmit = async (e) => {
        e.preventDefault()

        const dataRegistro = formatTimestamp(new Date())

        let dados = {
            id: veiculo.id, placa, marca: dadosVeiculo.marca, modelo: dadosVeiculo.modelo, cor: dadosVeiculo.cor, renavan: dadosVeiculo.renavan,
            unidade: dadosVeiculo.unidade, data_cadastro: dadosVeiculo.data_cadastro, solicitante, observacoes, motivo: selectedMotivo,
            ano_fabricacao: veiculo.ano_fabricacao, ano_modelo: dadosVeiculo.ano_modelo, dataRegistro

        }

        dados = toUpperFields(dados, ['placa', 'marca', 'modelo', 'cor', 'unidade', 'motivo', 'solicitante', 'observacoes'])
        // Padroniza para caixa alta
        console.log('Dados a serem enviados: ', dados)

        const confirmar = window.confirm("Você tem certeza que deseja realizar a baixa deste veículo?");

        if (confirmar && dadosVeiculo.marca === "" || dadosVeiculo.modelo === "" || dadosVeiculo.cor === "" ||
            dadosVeiculo.unidade === "" || dadosVeiculo.motivo === "" || solicitante === "") {
            window.alert("Por favor, verifique o formulario novamente. Todos os campos precisam ser preenchidos.")
        } else {
            try {

                await createData(dados)
                await deleteData(placa)
                window.alert('Baixa realizada com sucesso')
                resetForm()
            } catch (err) {
                console.error('Falha ao baixar o veiculo: ', err)
                window.alert('Falha ao baixar o veículo.\nEntre em contato com o suporte.')
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

            </div>

        </ContainerSecundario>
    )
}

export default BaixarVeiculo
