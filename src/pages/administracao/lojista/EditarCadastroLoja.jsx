import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css";
import Form from '../../../components/form/Form';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';
import ModalBootstrap from '../../../components/modal/ModalBootstrap';

import { useState, useRef, useEffect } from 'react';
import { useGetData } from '../../../services/useGetData';
import { useUpdateData } from "../../../services/useUpdateData";
import { formatTel } from "../../../hooks/useMask";
import { useDeleteId } from "../../../services/useDeleteId";

const EditarCadastroLoja = () => {
    const [buscaLoja, setBuscaLoja] = useState('');
    const [editavel, setEditavel] = useState(false);
    // estado local com todos os campos
    const [dadosLoja, setDadosLoja] = useState({ id: '', descricao: '', email: '', telefone: '', qtdVeiculos: '', qtdEstoqueExtra: '' });
    const resetForm = () => {
        setDadosLoja({ id: '', descricao: '', email: '', telefone: '', qtdVeiculos: '' });
        ultimaLoja.current = ''
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
        buscaLoja ? `/lojas/descricao/${encodeURIComponent(buscaLoja)}` : null
    );

    const { updateData } = useUpdateData(`/lojas/${dadosLoja.id}`);
    const { deleteData } = useDeleteId(`/lojas`);

    // para evitar buscas repetidas na API
    const ultimaLoja = useRef('');

    // dispara busca quando sai do campo (blur)
    const handleBlur = () => {
        const term = dadosLoja.descricao.trim();
        if (term) {
            if (term !== ultimaLoja.current) {
                ultimaLoja.current = term;
                setBuscaLoja(term); // dispara fetch
            }
            setEditavel(true);
        } else {
            setEditavel(false);
            setDadosLoja({ id: '', descricao: '', email: '', telefone: '', qtdVeiculos: '', qtdEstoqueExtra: '' });
        }
    };

    // popula estado local quando chegam dados da API
    useEffect(() => {
        if (dados && !dados.erro) {
            setDadosLoja({
                id: dados.id ?? '',
                descricao: dados.descricao ?? '',
                email: dados.email ?? '',
                telefone: dados.telefone ?? '',
                qtdVeiculos: dados.qtdVeiculos ?? dados.qntVeiculos ?? '',
                qtdEstoqueExtra: dados.qtdEstoqueExtra ?? dados.qntEstoqueExtra ?? ''
            });
        } else if (dados && dados.erro) {
            console.log('Loja não encontrada');
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
        setDadosLoja(prev => ({ ...prev, telefone: formatted }));
    };

    // envia dados editados
    const handleEdit = async (e) => {
        e.preventDefault();

        setModal({
            aberto: true,
            titulo: "Confirmação de Edição",
            mensagem: `Confirma a edição dos dados da loja?`,
            tipo: "confirmacao",
            acao: confirmarEdicao
        });
    }

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
            id: dadosLoja.id,
            descricao: dadosLoja.descricao,
            telefone: dadosLoja.telefone,
            email: dadosLoja.email,
            qtdVeiculos: dadosLoja.qtdVeiculos,
            qtdEstoqueExtra: dadosLoja.qtdEstoqueExtra
        };

        const dadosUpper = toUpperFields(dadosPayload, ['descricao']);

        if (dadosLoja.qtdVeiculos === '' || isNaN(dadosLoja.qtdVeiculos)) {
            alertasAcoes("Atenção!", 'Quantidade de veículos deve ser um número válido.');
            return;
        }

        try {
            // ajuste conforme assinatura do seu hook
            await updateData(dadosUpper, dadosLoja.id);
            alertasAcoes("Sucesso", 'Cadastro editado com sucesso', resetForm);
            return
        } catch {
            alertasAcoes("Atenção!", 'Falha ao editar o cadastro da loja.\nEntre em contato com o suporte.', resetForm);
            return
        }
    }

    //Excluindo uma loja
    const handleDelete = async (e) => {
        e.preventDefault()

        setModal({
            aberto: true,
            titulo: "Confirmação de Exclusao",
            mensagem: `Confirma a exlusão da loja?`,
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

        if (dadosLoja.descricao === '' || dadosLoja.email === '' || dadosLoja.qtdEstoqueExtra === '' || dadosLoja.qtdVeiculos === '' || dadosLoja.telefone === '') {
            alertasAcoes("Atenção!", "Todos os campos devem ser preenchidos. Verifique o formulario e tente novamente.")
            return
        } else {
            try {
                await deleteData(dadosLoja.id)
                alertasAcoes("Sucesso", "Loja excluída com sucesso.", resetForm)
                return
            } catch {
                alertasAcoes("Atenção!", "Não foi possível excluir a loja.\nEntre em contato com o suporte.")
                return
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
            <div className='panel-heading'>
                <i className='ti ti-home' id="ti-black"></i>
                <p>EDITAR LOJA <br /> Informe o nome da loja para editar os dados</p>
            </div>
            <Form onSubmit={handleEdit}>
                <div className="col-12 col-md-4">
                    {/* campo de busca/controlado */}
                    <Input label="Nome:" type="text" style={{ width: '200px' }} nameInput="descricao" value={dadosLoja.descricao}
                        onChange={(e) => setDadosLoja(prev => ({ ...prev, descricao: e.target.value }))} onBlur={handleBlur} required />
                    {/* id escondido */}
                    <input type="hidden" value={dadosLoja.id} readOnly />
                </div>

                <div className="col-12 col-md-4">
                    <Input label="Email:" type="text" style={{ width: '300px' }} nameInput="email" value={dadosLoja.email} readOnly={!editavel}
                        onChange={(e) => setDadosLoja(prev => ({ ...prev, email: e.target.value }))} />
                </div>

                <div className="col-12 col-md-3">
                    <Input label="Telefone:" type="text" style={{ width: '150px' }} nameInput="telefone"
                        value={dadosLoja.telefone} readOnly={!editavel} onChange={handlePhoneChange} />
                </div>

                <div className="col-12 col-md-12">
                    <Input label="Quantidade de Veículos:" type="text" style={{ width: '80px' }} nameInput="qtdVeiculos" value={dadosLoja.qtdVeiculos}
                        readOnly={!editavel} onChange={(e) => setDadosLoja(prev => ({ ...prev, qtdVeiculos: e.target.value }))} />
                </div>
                <div className="col-12 col-md-12">
                    <Input label="Estoque Extra:" type="text" style={{ width: '80px' }} nameInput="qtdEstoqueExtra" value={dadosLoja.qtdEstoqueExtra}
                        readOnly={!editavel} onChange={(e) => setDadosLoja(prev => ({ ...prev, qtdEstoqueExtra: e.target.value }))} />
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
                            EXCLUIR LOJA
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

export default EditarCadastroLoja;
