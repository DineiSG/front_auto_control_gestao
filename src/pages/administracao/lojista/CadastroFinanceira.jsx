import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import Form from '../../../components/form/Form';
import Box from "../../../components/box/Box"
import ContainerSecundario from "../../../components/container/ContainerSecundario"
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';
import EditarCadastroFinanceira from "./EditarCadastroFinanceira";
import ModalBootstrap from '../../../components/modal/ModalBootstrap';

import { useState } from 'react';
import { usePostData } from '../../../services/usePostData';
import { formatTimestamp } from '../../../hooks/formatDate';
import { formatTel, formatCNPJ } from "../../../hooks/useMask"
import { useAuth } from "../../../hooks/useAuth"

const CadastroFinanceira = () => {

    const [telefone, setTelefone] = useState('')
    const [email, setEmail] = useState('')
    const [descricao, setDescricao] = useState('')
    const [agente, setAgente] = useState('')
    const [cnpj, setCnpj] = useState('')
    const [modal, setModal] = useState({
        aberto: false,
        titulo: "Atenção",
        mensagem: "",
        tipo: "mensagem",
        acao: null,
    });
    const resetForm = () => {
        setAgente(''), setTelefone(''), setCnpj(''), setDescricao(''), setEmail('')

    }

    const { user } = useAuth()

    // Envia os dados do veículo
    const { createData } = usePostData('/bancos')

    // Base URL da API
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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



    // Função para lidar com o cadastro da loja
    const handleSubmit = async (e) => {
        e.preventDefault()

        setModal({
            aberto: true,
            titulo: "Confirmação de Cadastro",
            mensagem: `Confirma o cadastro da instituição financeira?`,
            tipo: "confirmacao",
            acao: confirmarCadastro
        });
    }

    const confirmarCadastro = async () => {

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

        const resCnpj = await fetch(`${API_BASE_URL}/bancos/cnpj?cnpj=${encodeURIComponent(cnpj)}`);
        console.log(resCnpj)
        const validarBanco = await resCnpj.json()

        //Esta funçao serve para verificar se o cnpj informado no formulario ja se encontra cadastrado
        //const resultado = validarBanco.some(validarBanco => validarBanco.cnpj === cnpj)

        const data_registro = formatTimestamp(new Date())

        // Envia os dados da loja
        let dados = { descricao, telefone, email, data_registro, cnpj, agente, audit: user?.nome }

        // Padroniza para caixa alta
        dados = toUpperFields(dados, ['descricao'])

        // Verifica se todos os campos obrigatórios estão preenchidos
        if (descricao === '' || telefone === '' || email === '' || agente === '' || cnpj === '') {
            alertasAcoes("Atenção!", "Todos os campos devem ser preenchidos. Verifique o formulario e tente novamente.", resetForm);
            return;
        } else if (validarBanco === true) {
            alertasAcoes("Atenção!", `Esta instituição ja se encontra cadastrada na base de dados. Operação nao permitida!`, resetForm)
            return
        } else {
            try {
                await createData(dados)
                alertasAcoes("Sucesso", 'Instituição cadastrada com sucesso', resetForm)
                return
            } catch {
                alertasAcoes("Atenção", 'Falha ao cadastrar a instituição.\nEntre em contato com suporte.')
            }
        }
    }

    const fecharModal = () => {
        setModal(prev => ({
            ...prev,
            aberto: false
        }));
    };

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
                            <a className="link_a" href="/administracao">Administraçao</a>
                        </div>
                        <div className="p-2">
                            <i className=' ti ti-angle-right ' id='card-path' />
                        </div>
                        <div className="p-2">
                            <p className='atual'>Cadastrar Instituição Financeira </p>
                        </div>
                    </div>
                </div>

                <div className="container d-flex justify-content-center card-container">
                    <Box>
                        <div className='panel-heading'>
                            <i className='ti ti-money' id="ti-black"></i>
                            <p>CADASTRAR INSTITUIÇÃO FINANCEIRA <br /> Informe os dados para cadastrar a instituição financeira na base de dados</p>
                        </div>
                        <Form onSubmit={handleSubmit}>
                            <div className="col-12 col-md-5">
                                <Input label={"Nome Instituição:"} type={"text"} style={{ width: '200px' }} nameInput={"placa"}
                                    value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
                            </div>
                            <div className="col-12 col-md-5">
                                <Input label={"CNPJ:"} type={"text"} style={{ width: '200px' }} nameInput={"marca"}
                                    value={cnpj} maxLength={18} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} required />
                            </div>
                            <div className="col-12 col-md-5">
                                <Input label={"Nome Agente:"} type={"text"} style={{ width: '300px' }} nameInput={"placa"}
                                    value={agente} onChange={(e) => setAgente(e.target.value)} required />
                            </div>
                            <div className="col-12 col-md-4">
                                <Input label={"Email:"} type={"text"} style={{ width: '250px' }} nameInput={"modelo"}
                                    value={email} onChange={(e) => setEmail(e.target.value)} required />
                            </div>
                            <div className="col-12 col-md-3">
                                <Input label={"Telefone:"} type={"text"} style={{ width: '150px' }} nameInput={"marca"}
                                    value={telefone} maxLength={14} onChange={(e) => setTelefone(formatTel(e.target.value))} required />
                            </div>
                            <div className="d-flex flex-row-reverse">
                                <Button type="submit" variant='primary'>SALVAR</Button>
                            </div>
                        </Form>
                        <hr />
                        <EditarCadastroFinanceira />
                    </Box>
                    <>
                        <ModalBootstrap modal={modal} fecharModal={fecharModal} id="modal" />
                    </>
                </div>
            </ContainerSecundario>
        </div>
    )
}

export default CadastroFinanceira
