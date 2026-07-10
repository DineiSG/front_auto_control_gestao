import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css";
import Form from '../../../components/form/Form';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';
import { useState, useRef, useEffect } from 'react';
import { useGetData } from '../../../services/useGetData';
import { useDeleteId } from "../../../services/useDeleteId";
import { formatTel } from "../../../hooks/useMask";
import { useAuth } from "../../../hooks/useAuth"

const EditarVendedor = () => {

    const [buscaVendedor, setBuscaVendedor] = useState('');
    // estado local com todos os campos
    const [dadosVendedor, setDadosVendedor] = useState({ id: '', nome: '', email: '', telefone: '', unidade: '' });

    // Limpa os campos do formulario após a exclusao
    const resetForm = () => {
        setDadosVendedor({ id: '', nome: '', email: '', telefone: '', unidade: '' });
        ultimoVendedor.current = ''
    }

    const { user } = useAuth()
    const usuarioAtivo = user?.nome.split('.').toString()
    console.log('Usuário ativo: ', usuarioAtivo)

    // busca os dados quando houver termo
    const { data: dados, loading } = useGetData(
        buscaVendedor ? `/vendedor/nome/${encodeURIComponent(buscaVendedor)}` : null
    );

    const { deleteData } = useDeleteId(`/vendedor`);

    // para evitar buscas repetidas na API
    const ultimoVendedor = useRef('');

    // dispara busca quando sai do campo (blur)
    const handleBlur = () => {
        const term = dadosVendedor.nome.trim();
        if (term) {
            if (term !== ultimoVendedor.current) {
                ultimoVendedor.current = term;
                setBuscaVendedor(term); // dispara fetch
            }
        } else {
            setDadosVendedor({ id: '', nome: '', email: '', telefone: '', unidade: '' });
        }
    };

    // popula estado local quando chegam dados da API
    useEffect(() => {
        if (dados && !dados.erro) {
            setDadosVendedor({
                id: dados.id ?? '',
                nome: dados.nome ?? '',
                email: dados.email ?? '',
                telefone: dados.telefone ?? '',
                unidade: dados.unidade ?? ''
            });
        } else if (dados && dados.erro) {
            console.log('Vendedor não encontrado');
        }
    }, [dados]);

    // formata telefone enquanto digita
    const handlePhoneChange = (e) => {
        const formatted = formatTel(e.target.value);
        setDadosVendedor(prev => ({ ...prev, telefone: formatted }));
    };


    const handleDelete = async (e) => {
        e.preventDefault()

        if (!dadosVendedor.id) {
            window.alert('Nenhum vendedor selecionado para exclusão.');
            return;
        }

        //Verificando se a loja em que o vendedor está cadastrado é a mesma em que o usuario está logado
        if (dadosVendedor?.unidade !== usuarioAtivo) {
            alert(`O vendedor trabalha na loja "${dadosVendedor.unidade}", mas você está logado na loja "${usuarioAtivo}". Operação não permitida.`);
            return;
        }

        const confirmar = window.confirm("Confirma a exclusão do vendedor " + dadosVendedor.nome + "?")
        if (!confirmar) {
            return
        } else {
            try {
                await deleteData(dadosVendedor.id)
                window.alert("Vendedor excluído com sucesso")
                resetForm()
            } catch {
                window.alert("Não foi possível excluir o vendedor.\nEntre em contato com o suporte.")
            }
        }
    }
    return (
        <div>
            <div className='panel-heading'>
                <i className='ti ti-home' id="ti-black"></i>
                <p>CONSULTAR OU EXCLUIR VENDEDOR <br /> Informe o nome do vendedor</p>
            </div>
            <Form onSubmit={handleDelete}>
                <div className="col-12 col-md-4">
                    {/* campo de busca/controlado */}
                    <Input label="Nome:" type="text" style={{ width: '200px' }} nameInput="descricao" value={dadosVendedor.nome}
                        onChange={(e) => setDadosVendedor(prev => ({ ...prev, nome: e.target.value }))} onBlur={handleBlur} required />
                    {/* id escondido */}
                    <input type="hidden" value={dadosVendedor.id} readOnly />
                </div>
                <div className="col-12 col-md-4">
                    <Input label="Email:" type="text" style={{ width: '300px' }} nameInput="email" value={dadosVendedor.email} readOnly
                        onChange={(e) => setDadosVendedor(prev => ({ ...prev, email: e.target.value }))} />
                </div>
                <div className="col-12 col-md-3">
                    <Input label="Telefone:" type="text" style={{ width: '150px' }} nameInput="telefone"
                        value={dadosVendedor.telefone} readOnly onChange={handlePhoneChange} />
                </div>
                <div className="col-12 col-md-12">
                    <div className="d-flex flex-row-reverse">
                        <Button type="submit" variant='danger' onClick={handleDelete}>
                            {loading && (
                                <div className="d-flex flex-row-start" role="status" > </div>
                            )}
                            EXCLUIR VENDEDOR
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default EditarVendedor
