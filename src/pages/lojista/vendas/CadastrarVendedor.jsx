import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import Form from '../../../components/form/Form';
import Box from "../../../components/box/Box"
import ContainerSecundario from "../../../components/container/ContainerSecundario"
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';
import Table from "../../../components/table/Table";

import { useState, useRef, useEffect } from 'react';
import { usePostData } from '../../../services/usePostData';
import { formatTimestamp } from '../../../hooks/formatDate';
import { formatTel, formatCPF } from "../../../hooks/useMask";
import { useAuth } from "../../../hooks/useAuth"
import { useGetData } from "../../../services/useGetData";
import EditarVendedor from "./EditarVendedor";

const CadastrarVendedor = () => {

    const [vendedorUnidade, setVendedorUnidade] = useState([])
    const [telefone, setTelefone] = useState('')
    const [email, setEmail] = useState('')
    const [nome, setNome] = useState('')
    const [cpf, setCpf] = useState('')
    const tabelaRef = useRef(null);

    const { user } = useAuth()
    const usuarioAtivo = user?.nome.split('.').toString()
    console.log('Usuário ativo: ', usuarioAtivo)

    //Limpa os campos do formulario apos o envio
    const resetForm = () => {
        setTelefone(''), setEmail(''), setNome('')
    }
    // Envianos dados para serem salvos na tabela vendedor
    const { createData } = usePostData('/vendedor')

    // Busca os vendedores cadastrados na unidade do lojista ativo

    const { data: vendedores } = useGetData(`/vendedor/unidade/${usuarioAtivo}`)

    // Atualiza a lista de vendedores quando a resposta da API muda
    useEffect(() => {

        if (vendedores && !vendedores.error && Array.isArray(vendedores)) {
            // Ordena os vendedores por ordem alfabética pelo nome
            const vendedoresOrdenados = vendedores.sort((a, b) => a.nome.localeCompare(b.nome))

            const vendedoresAtivos = vendedoresOrdenados.filter(
                vendedor => vendedor.status !== 'INATIVO'
            );

            setVendedorUnidade(vendedoresAtivos)
        }
    }, [vendedores])

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

    //Passando as colunas com as suas respectivas chaves

    const colunas = [

        { key: 'nome', label: 'NOME' },
        { key: 'email', label: 'EMAIL' },
        { key: 'telefone', label: 'TELEFONE' },
        { key: 'unidade', label: 'LOJA' }

    ]



    // Função para lidar com o envio do formulário
    const handleSubmit = async (e) => {
        e.preventDefault()

        const data_registro = formatTimestamp(new Date())

        // Envia nome da loja no campo 'unidade'
        let dados = {
            unidade: usuarioAtivo,
            nome,
            email,
            data_registro,
            telefone,
            cpf
        }

        console.log('Dados a serem enviados: ', dados)
        // Padroniza para caixa alta
        dados = toUpperFields(dados, ['unidade', 'nome'])

        // Verifica se todos os campos obrigatórios estão preenchidos
        const confirmar = window.confirm("Confirma o cadastro do vendedor?");
        if (!confirmar) {
            return
        } else if (window.confirm && nome === "" || email === "" || telefone === "") {
            window.alert("É obrigatorio preencher todos os campos do formulário.")
        } else {
            await createData(dados)
            window.alert('Vendedor cadastrado com sucesso')
            resetForm()
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
                        <a className="link_a" href="/lojista">Lojista</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <p className='atual'>Cadastrar Vendedor </p>
                    </div>
                </div>
            </div>
            <div className="container d-flex justify-content-center card-container">
                <Box>
                    <div className='panel-heading'>
                        <i className='ti ti-user' id="ti-black"></i>
                        <p>CADASTRO DE VENDEDOR <br /> Informe os dados</p>
                    </div>
                    <Form onSubmit={handleSubmit}>
                        <div className="col-12 col-md-4">
                            <Input label={"Nome:"} type={"text"} style={{ width: '300px' }} nameInput={"placa"}
                                value={nome} onChange={(e) => setNome(e.target.value)} required />

                        </div>
                        <div className="col-6 col-md-6">
                            <Input label={"CPF:"} type={"text"} style={{ width: '150px' }} maxLength={14}
                                nameInput={"modelo"} value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder={"XXX.XXX.XXX-XX"} required />
                        </div>
                        <div className="col-12 col-md-4">
                            <Input label={"Email:"} type={"text"} style={{ width: '250px' }} nameInput={"modelo"}
                                value={email} onChange={(e) => setEmail(e.target.value)} required />
                        </div>
                        <div className="col-12 col-md-4">
                            <Input label={"Telefone:"} type={"text"} style={{ width: '150px' }} maxLength={14} nameInput={"marca"}
                                value={telefone} onChange={(e) => setTelefone(formatTel(e.target.value))} required />
                        </div>
                        <div className="d-flex flex-row-reverse">
                            <Button type="submit" variant='primary'>ENVIAR</Button>
                        </div>
                    </Form>
                    <br />
                    <div className="table-responsive" id="tabela_dados" ref={tabelaRef}>
                        <Table data={vendedorUnidade} columns={colunas} className={"table table-striped table-bordered no-footer"} role="grid" id="estoque" />
                    </div>
                    <br />
                    <hr />
                    <EditarVendedor />
                </Box>
            </div>
        </ContainerSecundario>

    )
}

export default CadastrarVendedor
