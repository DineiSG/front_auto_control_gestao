import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import Form from '../../../components/form/Form';
import Box from "../../../components/box/Box"
import ContainerSecundario from "../../../components/container/ContainerSecundario"
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';

import { useState } from 'react';
import { usePostData } from '../../../services/usePostData';
import { formatTimestamp } from '../../../hooks/formatDate';
import { formatCNPJ, formatTel } from "../../../hooks/useMask"
import EditarCadastroLoja from "./EditarCadastroLoja";
import { useAuth } from "../../../hooks/useAuth"

const CadastroLoja = () => {

  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [descricao, setDescricao] = useState('')
  const [qtdVeiculos, setQtdVeiculos] = useState('')
  const [qtdEstoqueExtra, setQtdEstoqueExtra] = useState('')
  const [cnpj, setCnpj] = useState('')

  const resertForm = () => {
    setCnpj(''), setDescricao(''), setEmail(''), setQtdVeiculos(''), setTelefone(''), setQtdEstoqueExtra('')
  }


  // Envia os dados do veículo
  const { createData } = usePostData('/lojas')

  const { user } = useAuth()

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

    const data_registro = formatTimestamp(new Date())

    // Envia os dados da loja
    let dados = { descricao, telefone, email, qtdVeiculos, qtdEstoqueExtra, data_registro, cnpj, audit: user?.nome }
    console.log('Dados a serem enviados: ', dados)

    // Padroniza para caixa alta
    dados = toUpperFields(dados, ['descricao'])

    // Verifica se todos os campos obrigatórios estão preenchidos
    const confirmar = window.confirm("Confirma o cadastro da loja?");

    if (confirmar && descricao === '' || telefone === '' || email === '' || qtdVeiculos === '' || data_registro === '' || cnpj === '') {
      window.alert("Todos os campos devem ser preenchidos.")
      return
    }
    else {
      try {
        await createData(dados)
        window.alert('Loja cadastrada com sucesso')
        resertForm()
      } catch (err) {
        console.error('Falha ao registrar a loja: ', err)
        window.alert('Falha ao cadastrar a loja.\nEntre em contato com o suporte.')
      }
    }
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
              <a className="link_a" href="/administracao">Administraçao</a>
            </div>
            <div className="p-2">
              <i className=' ti ti-angle-right ' id='card-path' />
            </div>
            <div className="p-2">
              <p className='atual'>Cadastrar Loja </p>
            </div>
          </div>
        </div>
        <div className="container d-flex justify-content-center card-container">
          <Box>
            <div className='panel-heading'>
              <i className='ti ti-home' id="ti-black"></i>
              <p>CADASTRAR LOJA <br /> Informe os dados</p>
            </div>
            <Form onSubmit={handleSubmit}>
              <div className="col-12 col-md-4">
                <Input label={"Nome:"} type={"text"} style={{ width: '300px' }} nameInput={"placa"}
                  value={descricao} onChange={(e) => setDescricao(e.target.value)} required />
              </div>
              <div className="col-12 col-md-4">
                <Input label={"Email:"} type={"text"} style={{ width: '250px' }} nameInput={"modelo"}
                  value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="col-12 col-md-3">
                <Input label={"Telefone:"} type={"text"} style={{ width: '150px' }} nameInput={"marca"}
                  value={telefone} maxLength={14} onChange={(e) => setTelefone(formatTel(e.target.value))} required />
              </div>
              <div className="col-12 col-md-3">
                <Input label={"CNPJ:"} type={"text"} style={{ width: '200px' }} nameInput={"cnpj"}
                  value={cnpj} maxLength={18} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} required />
              </div>
              <div className="col-12 col-md-6">
                <Input label={"Quantidade de Veículos:"} type={"text"} style={{ width: '80px' }} nameInput={"marca"}
                  value={qtdVeiculos} onChange={(e) => setQtdVeiculos(e.target.value)} required />
              </div>
              <div className="col-12 col-md-6">
                <Input label={"Estoque Extra:"} type={"text"} style={{ width: '80px' }} nameInput={"marca"}
                  value={qtdEstoqueExtra} onChange={(e) => setQtdEstoqueExtra(e.target.value)} required />
              </div>
              <div className="d-flex flex-row-reverse">
                <Button type="submit" variant='primary'>ENVIAR</Button>
              </div>
            </Form>
            <hr />
            <br />
            <br />
            <EditarCadastroLoja />
          </Box>
        </div>
      </ContainerSecundario>
    </div>
  )
}

export default CadastroLoja
