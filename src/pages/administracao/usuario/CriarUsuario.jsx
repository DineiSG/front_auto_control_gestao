import React from 'react'
import ContainerSecundario from '../../../components/container/ContainerSecundario'
import Box from '../../../components/box/Box'
import Form from '../../../components/form/Form'
import Input from '../../../components/input/Input'
import { useState, useEffect, useRef } from 'react'
import { useGetData } from '../../../services/useGetData'
import Button from '../../../components/button/Button'
//import { useControlAuth } from '../../../services/useControlAuth'
import EditarUsuario from './EditarUsuario'
//import { useAuth } from "../../../hooks/useAuth"
import Table from "../../../components/table/Table"
//import { useApi } from '../../../hooks/useApi'

const CriarUsuario = () => {
  //const [nome, setNome] = useState('');
  //const [unidade, setUnidade] = useState('');
  //const [password, setPassword] = useState('');
  //const [confirmPassword, setConfirmPassword] = useState('')
  //const [errorFront, setErrorFront] = useState("")
  //const [tipo, setTipo] = useState('');
  //const [username, setUsername] = useState('')
  const [usuariosCadastrados, setUsuariosCadastrados] = useState([])

  /*const resetForm = () => {
    setUnidade(''), setNome(''), setUsername(''), setPassword(''), setConfirmPassword('')
  }*/

  const tabelaRef = useRef(null);

  //const { user } = useAuth()

  // Base URL da API
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // Recebe os dados das lojas para popular o select
  //const { data: dadosLoja } = useGetData(`/lojas`)

  // Recebe os dados dos usuarios para popular a tabela
  const { data: usuarios } = useGetData(`/usuario`)

  // Função para converter campos em CAIXA ALTA
  /*const toUpperFields = (obj, fields = []) => {
    const copy = { ...obj }
    fields.forEach((f) => {
      if (copy[f] !== undefined && copy[f] !== null) {
        copy[f] = String(copy[f]).toUpperCase()
      }
    })
    return copy
  }*/


  // Ordena as lojas por descrição
  //const lojasOrdenadas = dadosLoja.sort((a, b) => a.descricao.localeCompare(b.descricao))

  //Enviando os dados pora o banco. chamando a apide autenticação
  //const { createUser, loading } = useControlAuth("/create-user")

  /* const handleBlur = async () => {
 
     const userCad = username.toUpperCase()
     console.log(userCad)
 
     try {
       // 1 Verifica se o usuario existe
       const resUser = await fetch(`${API_BASE_URL}/usuario/username/${userCad}`);
 
       if (resUser.status === 200) {
         // Já cadastrado → limpar e bloquear
         window.alert('Ja consta um usuario cadastrado com este nome. Caso deseje criar um novo, insira um nome válido');
         resetForm()
         return;
       } else if (resUser.status !== 404) {
         window.alert("Não foi possivel validar se o usuario ja existe. Por favor entre em contato com o suporte.")
         throw new Error(`Erro na API de cadastro de usuario: ${resUser.status}`);
       }
 
     } catch (erro) {
       console.error('Erro ao buscar usuario:', erro);
     }
   }*/

  //Criando o username a partir do nome, pegando o primeiro e o último nome.
  /*useEffect(() => {
    const tipoUsuario = tipo

    if (tipoUsuario === 'administrador' || tipoUsuario === 'suporte' || tipoUsuario === 'colaborador') {
      const partes = nome
        .trim()
        .split(" ")
        .filter(p => p !== "");

      const primeiro = partes[0] || "";
      const ultimo = partes.length > 1 ? partes[partes.length - 1] : "";

      setUsername(`${primeiro}.${ultimo}`.trim());
    } else {
      setUsername(nome.trim())
    }
  }, [nome, tipo])*/

  //Ordenando as lojas por ordem alfabética
  /*const handleUnidadeChange = (e) => {
    const selectedOption = e.target.selectedOptions[0]
    const descricao = selectedOption.getAttribute('data-descricao')

    setUnidade(descricao)
    console.log('State atualizado - Loja:', descricao);
  }*/

  //Atualiza a lista de usuarios quando a resposta da API muda
  useEffect(() => {
    if (usuarios && !usuarios.error && Array.isArray(usuarios)) {
      const usuariosOrdenados = usuarios.sort((a, b) => a.nome.localeCompare(b.nome))
      setUsuariosCadastrados(usuariosOrdenados)
    }
  }, [usuarios])

  const colunas = [
    { key: 'nome', label: 'NOME' },
    { key: 'username', label: 'NOME DE USUARIO' },
    { key: 'unidade', label: 'LOJA' },
    { key: 'tipo', label: 'TIPO DE USUARIO' }
  ]

  //Enviando os dados para o beck end
  /*const handleSubmit = async (e) => {
    e.preventDefault()

    // Verificando se as senhas são iguais
    if (password !== confirmPassword) {
      setErrorFront("As senhas precisam ser iguais!")
      return
    }

    let dadosUsuario = { nome, unidade, password, tipo, username, audit: user?.nome }
    console.log('Dados informados: ', dadosUsuario)

    const usuario = toUpperFields(dadosUsuario, ['nome', 'unidade', 'tipo', 'username'])
    console.log(usuario)

    const confirmar = window.confirm("Confirma o cadastro do usuário?");

    if (!confirmar) return;

    if (nome === "" || unidade === "" || password === "" || tipo === "") {
      window.alert("Por favor, verifique o formulario novamente Todos os campos precisam ser preenchidos.")
      return
    } else {
      try {
        await createUser(usuario)
        console.log(usuario)
        window.alert("Usuario criado. \nAnote o nome do usuário: " + username)
        resetForm()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch {
        window.alert("Não foi possivel cadastrar o usuario. Entre em contato com o suporte.")
      }
    }
  }*/


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
            <p className='atual'>Gestão de Usuários</p>
          </div>
        </div>
      </div>
      <div className="container d-flex justify-content-center card-container">
        <Box>
          <div className='panel-heading'>
            <i className='ti ti-user' id="ti-black"></i>
            <p>USUARIOS CADASTRADOS <br /> Abaixo se encontram todos os usuarios cadastrado no sistema Auto Control</p>
          </div>
          {/* <Form onSubmit={handleSubmit}>
            <div className="col-12 col-md-4">
              <Input label={"Nome:"} type={"text"} maxLength={"150"} style={{ width: '300px' }} nameInput={"nome"}
                value={nome} onChange={(e) => setNome(e.target.value)} onBlur={handleBlur} required />
            </div>
            <div className='col-12 col-md-3' id='select-all'>
              <label className="label" id="select-label"><span>Loja:</span></label>
              <select type='text' name='loja' value={unidade} onChange={handleUnidadeChange} className="select-item" required >
                <option value="" >SELECIONE UMA LOJA</option>
                {lojasOrdenadas.map((loja) => (
                  <option key={loja.descricao} value={loja.descricao} data-descricao={loja.descricao}>
                    {loja.descricao}
                  </option>
                ))}
              </select>
            </div>
            <div className='col-12 col-md-4' id='select-all'>
              <label className="label" id="select-label"><span>Tipo de Usuário:</span></label>
              <select type='text' name='tipo' value={tipo} onChange={(e) => setTipo(e.target.value)} className="select-item" required >
                <option value="" >SELECIONE O TIPO</option>
                <option value="administrador">Administrador</option>
                <option value="colaborador">Colaborador</option>
                <option value="lojista">Lojista</option>
                <option value="suporte">Suporte</option>
              </select>
            </div>
            <div className="col-12 col-md-3">
              <Input label={"Senha:"} type={"password"} maxLength={"50"} style={{ width: '200px' }} nameInput={"password"}
                value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="col-12 col-md-8" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Input label={"Confirmar Senha:"} type={"password"} maxLength={"50"} style={{ width: "200px" }}
                nameInput={"confirmPassword"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              {password !== confirmPassword && confirmPassword && (
                <p className="col-12 col-md-6" style={{ color: "red", fontSize: "16px", fontWeight: "bold", margin: 0 }}>
                  Atenção: As senhas não coincidem!
                </p>
              )}
              {errorFront && <p className="error">{errorFront}</p>}
            </div>

            <div className="d-flex flex-row-reverse">
              <Button type="submit" variant='primary'>
                {loading && (
                  <div className="spinner-grow spinner-grow-sm flex-row-start" style={{ marginRight: '15px' }} role="status" > </div>
                )}
                CADASTRAR
              </Button>
            </div>
          </Form>*/}
          <br />
          <div>
            <Table data={usuariosCadastrados} columns={colunas} className={"table table-striped table-bordered table-data dataTable no-footer"} role="grid" id="estoque" />
          </div>
          <br />
          <hr />
          <div className="table-responsive" ref={tabelaRef}>
          </div>
          <br />
          <EditarUsuario />
        </Box>
      </div>

    </ContainerSecundario>
  )
}

export default CriarUsuario
