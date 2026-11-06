import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css";
import Form from '../../../components/form/Form';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';
import ModalBootstrap from '../../../components/modal/ModalBootstrap';
import { useState, useRef, useEffect } from 'react';
import { useGetData } from '../../../services/useGetData';
import { formatTel } from "../../../hooks/useMask";
import { useAuth } from "../../../hooks/useAuth"
import { useUpdateData } from "../../../services/useUpdateData";

const EditarVendedor = () => {

    // Base URL da API
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const [buscaVendedor, setBuscaVendedor] = useState('');
    const [nome, setNome] = useState('')
    // estado local com todos os campos
    const [dadosVendedor, setDadosVendedor] = useState({ id: '', email: '', telefone: '', unidade: '' });
    const [modal, setModal] = useState({
        aberto: false,
        titulo: "Atenção",
        mensagem: "",
        tipo: "mensagem",
        acao: null,

    });

    //Limpa os campos do formulario apos o envio
    const resetForm = () => {
        setBuscaVendedor('')
        setDadosVendedor({ id: '', nome: '', email: '', telefone: '', unidade: '' })
    }

    const { user } = useAuth()
    const usuarioAtivo = user?.nome.split('.').toString()
    console.log('Usuário ativo: ', usuarioAtivo)

    // Busca os dados quando houver termo
    const { data: dados, loading } = useGetData(
        buscaVendedor ? `/vendedor/nome/${encodeURIComponent(buscaVendedor)}` : null
    );

    const { updateData } = useUpdateData(`/vendedor/${dadosVendedor.id}`)

    // para evitar buscas repetidas na API
    const ultimoVendedor = useRef('');

    // dispara busca quando sai do campo (blur)
    const handleBlur = async () => {

        const lojaVendedor = await fetch(`${API_BASE_URL}/vendedor/nome/${nome}`);

        const dados = await lojaVendedor.json()

        console.log(dados.unidade)

        const alertasVendedor = (titulo, mensagem, aoFechar = null) => {
            setModal({
                aberto: true,
                titulo,
                mensagem,
                tipo: "mensagem",
                acao: "",
                aoFechar
            });
        }

        // Verifique se o vendedor pertence à unidade ativa
        if (dados.unidade !== usuarioAtivo) {
            if (nome === "") {
                alertasVendedor("Atenção!", "Informe um nome de um vendedor.", resetForm)
            } else {
                alertasVendedor("Atenção!", "Este vendedor nao esta cadastrado nessa unidade. Operação nao permitida.", resetForm)
            }

        } else {
            try {

                const term = nome.trim();
                if (term) {
                    if (term !== ultimoVendedor.current) {
                        ultimoVendedor.current = term;
                        setBuscaVendedor(term); // dispara fetch
                    }
                } else {
                    setDadosVendedor({ id: '', email: '', telefone: '', unidade: '', status: '' });
                }
            } catch {
                alertasVendedor("Atenção!", "Nao foi possivel consultar os dados do vendedor solicitado. Entre em contato com o suporte.", resetForm)
            }
        }



    };

    // popula estado local quando chegam dados da API
    useEffect(() => {
        if (dados && !dados.erro) {
            console.log('Dados do vendedor:', dados);
            setDadosVendedor(prev => ({
                ...prev,
                id: dados.id ?? '',
                email: dados.email ?? '',
                telefone: dados.telefone ?? '',
                unidade: dados.unidade ?? '',
                status: dados.status ?? ''
            }));
        } else if (dados && dados.erro) {
            console.log('Vendedor não encontrado');
        }
    }, [dados]);

    // formata telefone enquanto digita
    const handlePhoneChange = (e) => {
        const formatted = formatTel(e.target.value);
        setDadosVendedor(prev => ({ ...prev, telefone: formatted }));
    };

    const handleStatus = async (e) => {
        e.preventDefault()

        setModal({
            aberto: true,
            titulo: "Confirmação de Exclusao",
            mensagem: `Confirma a exclusao do vendedor ${dadosVendedor.nome}?`,
            tipo: "confirmacao",
            acao: confirmarExclusao
        });
    }

    const confirmarExclusao = async () => {

        if (!dadosVendedor.id) {

            const validacaoId = (titulo, mensagem, aoFechar = null) => {
                setModal({
                    aberto: true,
                    titulo,
                    mensagem,
                    tipo: "mensagem",
                    acao: "",
                    aoFechar
                });
            }

            validacaoId("Atenção!", 'Nenhum vendedor selecionado para exclusão.');
        }

        const statusVendedor = {
            id: dadosVendedor.id,
            status: "INATIVO"
        }

        try {
            await updateData(statusVendedor, dadosVendedor.id)

            const exclusaoOk = (titulo, mensagem, aoFechar = null) => {
                setModal({
                    aberto: true,
                    titulo,
                    mensagem,
                    tipo: "mensagem",
                    acao: "",
                    aoFechar
                });
            }

            exclusaoOk("Sucesso", "Vendedor excluído com sucesso", resetForm)
        } catch {
            window.alert("Não foi possível excluir o vendedor.\nEntre em contato com o suporte.")
        }
    }

    //Função para fechar o modal
    const fecharModal = () => {
        setModal(prev => ({
            ...prev,
            aberto: false
        }));
    };

    return (
        <div>
            <div className='panel-heading'>
                <i className='ti ti-close' id="ti-black"></i>
                <p>EXCLUIR VENDEDOR <br /> Informe o nome do vendedor</p>
            </div>
            <Form onSubmit={handleStatus}>
                <div className="col-12 col-md-4">
                    {/* campo de busca/controlado */}
                    <Input label="Nome:" type="text" style={{ width: '200px' }} nameInput="descricao" value={nome}
                        onChange={(e) => setNome(e.target.value)} onBlur={handleBlur} required />
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
                        <Button type="submit" variant='danger' onClick={handleStatus}>
                            {loading && (
                                <div className="d-flex flex-row-start" role="status" > </div>
                            )}
                            EXCLUIR
                        </Button>
                    </div>
                </div>
            </Form>
            <>
                <ModalBootstrap modal={modal} fecharModal={fecharModal} id="modal" />
            </>
        </div>
    )
}

export default EditarVendedor
