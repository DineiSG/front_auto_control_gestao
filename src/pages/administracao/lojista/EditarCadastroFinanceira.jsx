import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css";
import Form from '../../../components/form/Form';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';
import ModalBootstrap from '../../../components/modal/ModalBootstrap';

import { useState, useRef, useEffect } from 'react';
import { useGetData } from '../../../services/useGetData';
import { useUpdateData } from "../../../services/useUpdateData";
import { useDeleteId } from "../../../services/useDeleteId";
import { formatTel, formatCNPJ } from "../../../hooks/useMask";

const EditarCadastroFinanceira = () => {
    const [buscaFinanceira, setBuscaFinanceira] = useState('');
    const [editavel, setEditavel] = useState(false);
    // estado local com todos os campos
    const [dadosFinanceira, setDadosFinanceira] = useState({ id: '', descricao: '', cnpj: '', agente: '', email: '', telefone: '' });
    const resetForm = () => {
        setDadosFinanceira({ id: '', descricao: '', cnpj: '', agente: '', email: '', telefone: '' })
        ultimaInstituicao.current = ''
    }
    const [modal, setModal] = useState({
        aberto: false,
        titulo: "Atenção",
        mensagem: "",
        tipo: "mensagem",
        acao: null,
    });

    // busca os dados quando houver termo
    const { data: dados, loading } = useGetData(
        buscaFinanceira ? `/bancos/descricao/${encodeURIComponent(buscaFinanceira)}` : null
    );

    const { deleteData } = useDeleteId(`/bancos`)

    const { updateData } = useUpdateData(`/bancos/${dadosFinanceira.id}`);

    // para evitar buscas repetidas na API
    const ultimaInstituicao = useRef('');

    // dispara busca quando sai do campo (blur)
    const handleBlur = () => {
        const term = dadosFinanceira.descricao.trim();

        if (term) {
            if (term !== ultimaInstituicao.current) {
                ultimaInstituicao.current = term;
                setBuscaFinanceira(term); // dispara fetch
            }
            setEditavel(true);
        } else {
            setEditavel(false);
            setDadosFinanceira({ id: '', descricao: '', cnpj: '', agente: '', email: '', telefone: '' });
        }
    };

    // popula estado local quando chegam dados da API
    useEffect(() => {
        if (dados && !dados.erro) {
            console.log('Dados da instituiçao recebidos:', dados);
            setDadosFinanceira({
                id: dados.id ?? '',
                descricao: dados.descricao ?? '',
                cnpj: dados.cnpj ?? '',
                agente: dados.agente ?? '',
                email: dados.email ?? '',
                telefone: dados.telefone ?? ''
            });
        } else if (dados && dados.erro) {
            console.log('Instituição não encontrada');
        }
    }, [dados]);

    //tranforma as letras em caixa alta
    const toUpperFields = (obj, fields = []) => {
        const copy = { ...obj };
        fields.forEach((f) => {
            if (copy[f] !== undefined && copy[f] !== null) {
                copy[f] = String(copy[f]).toUpperCase();
            }
        });
        return copy;
    };

    // formata telefone enquanto digita
    const handlePhoneChange = (e) => {
        const formatted = formatTel(e.target.value);
        setDadosFinanceira(prev => ({ ...prev, telefone: formatted }));
    };

    const handleCnpjChange = (e) => {
        const formatted = formatCNPJ(e.target.value);
        setDadosFinanceira(prev => ({ ...prev, cnpj: formatted }));
    };

    // envia dados editados
    const handleEdit = async (e) => {
        e.preventDefault();

        setModal({
            aberto: true,
            titulo: "Confirmação de Edição",
            mensagem: `Confirma a edição dos dados da instituição financeira?`,
            tipo: "confirmacao",
            acao: confirmarEdicao
        });
    };

    const confirmarEdicao = async () => {

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

        const dadosPayload = {
            id: dadosFinanceira.id,
            descricao: dadosFinanceira.descricao,
            telefone: dadosFinanceira.telefone,
            email: dadosFinanceira.email,
            agente: dadosFinanceira.agente,
            cnpj: dadosFinanceira.cnpj
        };

        const dadosUpper = toUpperFields(dadosPayload, ['descricao']);

        if (dadosFinanceira.descricao === '' || dadosFinanceira.telefone === '' || dadosFinanceira.email === '' || dadosFinanceira.agente === '', dadosFinanceira.cnpj === '') {
            alertasAcoes("Atenção!", "Todos os campos devem ser preenchidos.\nVerifique o formulario e tente novamente.", resetForm);
            return;

        } else {

            try {
                await updateData(dadosUpper, dadosFinanceira.id);
                alertasAcoes("Sucesso", 'Cadastro da instituição editado com sucesso.', resetForm);
                return
            } catch {
                alertasAcoes("Atenção", 'Falha ao editar os dados da instituição.\nEntre em contato com suporte.')
            }
        }
    }


    const handleDelete = async (e) => {
        e.preventDefault()

        setModal({
            aberto: true,
            titulo: "Confirmação de Exclusão",
            mensagem: `Confirma a exclusao dos dados da instituição financeira?`,
            tipo: "confirmacao",
            acao: confirmarExclusao
        });
    }

    const confirmarExclusao = async () => {

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

        let deleteInstituicao = (dadosFinanceira.id)

        try {
            await deleteData(deleteInstituicao)
            alertasAcoes("Sucesso", "Instituição excluida com sucesso", resetForm)
            return
        } catch {
            alertasAcoes("Atenção!", "Não foi possivel excluir a instituiçao. Entre em contato com o suporte.", resetForm)
            return
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
            <div className='panel-heading'>
                <i className='ti ti-money' id="ti-black"></i>
                <p>EDITAR OU EXCLUIR INSTITUIÇÃO <br /> Informe o nome para buscar os dados e selecione o que deseja editar. Caso deseje excluir os dados da instituição, apenas clique em EXCLUIR</p>
            </div>
            <Form onSubmit={handleEdit}>
                <div className="col-12 col-md-5">
                    {/* campo de busca/controlado */}
                    <Input label="Nome:" type="text" style={{ width: '200px' }} nameInput="descricao" value={dadosFinanceira.descricao}
                        onChange={(e) => setDadosFinanceira(prev => ({ ...prev, descricao: e.target.value }))} onBlur={handleBlur} required />
                    {/* id escondido */}
                    <input type="hidden" value={dadosFinanceira.id} readOnly />
                </div>
                <div className="col-12 col-md-5">
                    <Input label="CNPJ:" type="text" style={{ width: '200px' }} nameInput="cnpj"
                        value={dadosFinanceira.cnpj} readOnly={!editavel} onChange={handleCnpjChange} />
                </div>
                <div className="col-12 col-md-5">
                    <Input label="Nome Agente:" type="text" style={{ width: '300px' }} nameInput="agente" value={dadosFinanceira.agente} readOnly={!editavel}
                        onChange={(e) => setDadosFinanceira(prev => ({ ...prev, agente: e.target.value }))} />
                </div>
                <div className="col-12 col-md-4">
                    <Input label="Email:" type="text" style={{ width: '300px' }} nameInput="email" value={dadosFinanceira.email} readOnly={!editavel}
                        onChange={(e) => setDadosFinanceira(prev => ({ ...prev, email: e.target.value }))} />
                </div>
                <div className="col-12 col-md-3">
                    <Input label="Telefone:" type="text" style={{ width: '150px' }} nameInput="telefone"
                        value={dadosFinanceira.telefone} readOnly={!editavel} onChange={handlePhoneChange} />
                </div>
                <div className="col-12 col-md-6">
                    <div className="d-flex flex-row-start">
                        <Button type="submit" variant='primary' onClick={handleEdit}>
                            {loading && (
                                <div className="d-flex flex-row-start" role="status" > </div>
                            )}
                            SALVAR ALTERAÇÕES
                        </Button>
                    </div>
                </div>
                <div className="col-12 col-md-6">
                    <div className="d-flex flex-row-reverse">
                        <Button type="submit" variant='danger' onClick={handleDelete}>
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
    );
};

export default EditarCadastroFinanceira;
