import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css";
import Form from '../../../components/form/Form';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';

import { useState, useRef, useEffect } from 'react';
import { useGetData } from '../../../services/useGetData';
import { useControlAuth } from '../../../services/useControlAuth'
import { useDeleteId } from "../../../services/useDeleteId";

const EditarUsuario = () => {
  const [dadosUsuario, setDadosUsuario] = useState('')
  const [buscaUsuario, setBuscaUsuario] = useState('')
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('')


  const resetForm = () => {
    setDadosUsuario({ username: '', nome: '', unidade: '', tipo: '' })
    setPassword('')
    setConfirmPassword('')
    ultimoUsuario.current = ''
  }

  const { data: dados, status, loading, error } = useGetData(buscaUsuario ? `/usuario/username/${encodeURIComponent(buscaUsuario)}` : null);

  const { updateData } = useControlAuth(`/${dadosUsuario.id}`);

  const { deleteData } = useDeleteId(`/usuario`)

  const ultimoUsuario = useRef('')

  // Quando é digitado o Username e o foco sai do input, esta função detecta e busca os dados do usuario
  const handleBlur = () => {
    const term = dadosUsuario.username?.trim();

    if (!term || term.length < 3) return;

    if (term !== ultimoUsuario.current) {
      ultimoUsuario.current = term;
      setBuscaUsuario(term);
    }
  };


  // popula estado local quando chegam dados da API
  useEffect(() => {
    if (!buscaUsuario) return;

    if (loading) return;

    if (dados) {
      setDadosUsuario({
        id: dados.id ?? '',
        username: dados.username ?? '',
        nome: dados.nome ?? '',
        tipo: dados.tipo ?? '',
        unidade: dados.unidade ?? ''
      });

    }
    if (status === error) {
      window.alert("Usuário não encontrado.");
    }

  }, [dados, error, status, buscaUsuario, loading]);

  //Envia a alteração de senha do usuario de acordo com o id
  const handleEdit = async (e) => {
    e.preventDefault();

    let alterData = { password }

    const confirmar = window.confirm("Confirma a alteração da senha do usuario: " + dadosUsuario.nome + " ?")
    if (!confirmar) {
      return
    } else {
      try {
        await updateData(alterData, dadosUsuario.id)
        window.alert("Senha alterada com sucesso")
        resetForm()
      } catch {
        window.alert("Não foi possivel alterar a senha. Entre em contato com o suporte.")
      }
    }
  }


  const handleDelete = async (e) => {
    e.preventDefault()

    let deleteUser = (dadosUsuario.id)

    const confirmar = window.confirm("Confirma a exclusao do usuario " + dados.nome + "?")
    if (!confirmar) {
      return
    } else {
      try {
        await deleteData(deleteUser)
        window.alert("Usuário excluido com sucesso")
        resetForm()
      } catch {
        window.alert("Não foi possivel excluir o usuario. Entre em contato com o suporte.")
      }
    }
  }

  return (
    <div>
      <div className='panel-heading'>
        <i className='ti ti-search' id="ti-black"></i>
        <p>BUSCAR USUARIO <br /> Informe o username</p>
      </div>
      <Form onSubmit={handleEdit}>
        <div className="col-12 col-md-4">
          {/* campo de busca/controlado */}
          <Input label="Username:" type="text" style={{ width: '200px' }} nameInput="username" value={dadosUsuario.username}
            onChange={(e) => setDadosUsuario(prev => ({ ...prev, username: e.target.value }))} onBlur={handleBlur} required />
          {/* id escondido */}
          <Input type="hidden" value={dadosUsuario.id} readOnly />
        </div>
        <div className="col-12 col-md-6">
          <Input label="Nome:" type="text" style={{ width: '200px' }} nameInput="nome" value={dadosUsuario.nome} readOnly />
        </div>
        <div className="col-12 col-md-4">
          <Input label="Unidade:" type="text" style={{ width: '150px' }} nameInput="unidade" value={dadosUsuario.unidade} readOnly />
        </div>
        <div className="col-12 col-md-4">
          <Input label="Tipo de Usuario:" type="text" style={{ width: '150px' }} nameInput="qtdVeiculos" value={dadosUsuario.tipo} readOnly />
        </div>
        <br />
        <br />
        <br />
        <br />
        <div className='panel-heading'>
          <i className='ti ti-lock' id="ti-black" tipo="hidden"></i>
          <p>ALTERAR SENHA</p>
        </div>
        <div className="col-12 col-md-12">
          <Input label={"Senha:"} type={"password"} maxLength={"50"} style={{ width: '200px' }} nameInput={"password"}
            value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="col-12 col-md-12" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Input label={"Confirmar Senha:"} type={"password"} maxLength={"50"} style={{ width: "200px" }}
            nameInput={"confirmPassword"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          {password !== confirmPassword && confirmPassword && (
            <p className="col-12 col-md-4" style={{ color: "red", fontSize: "16px", fontWeight: "bold", margin: 0 }}>
              Atenção: As senhas não coincidem!
            </p>
          )}
        </div>
        <div className="col-12 col-md-6">
          <div className="d-flex flex-row-start">
            <Button type="submit" variant='primary' onClick={handleEdit}>
              {loading && (
                <div className="d-flex flex-row-start" role="status" > </div>
              )}
              SALVAR SENHA
            </Button>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="d-flex flex-row-reverse">
            <Button type="submit" variant='danger' onClick={handleDelete}>
              {loading && (
                <div className="d-flex flex-row-start" role="status" > </div>
              )}
              EXCLUIR USUÁRIO
            </Button>
          </div>
        </div>
      </Form>
    </div>
  )
}

export default EditarUsuario
