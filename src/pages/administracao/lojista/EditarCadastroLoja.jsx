import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css";
import Form from '../../../components/form/Form';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';

import { useState, useRef, useEffect } from 'react';
import { useGetData } from '../../../services/useGetData';
import { useUpdateData } from "../../../services/useUpdateData";
import { useDeleteData } from "../../../services/useDeleteData";
import { formatTel } from "../../../hooks/useMask";

const EditarCadastroLoja = () => {
    const [buscaLoja, setBuscaLoja] = useState('');
    const [editavel, setEditavel] = useState(false);
    // estado local com todos os campos
    const [dadosLoja, setDadosLoja] = useState({ id: '', descricao: '', email: '', telefone: '', qtdVeiculos: '' });

    const resetForm = () => {
        setDadosLoja({ id: '', descricao: '', email: '', telefone: '', qtdVeiculos: '' });
        ultimaLoja.current = ''
    }

    // busca os dados quando houver termo
    const { data: dados, loading } = useGetData(
        buscaLoja ? `/lojas/descricao/${encodeURIComponent(buscaLoja)}` : null
    );

    const { updateData } = useUpdateData(`/lojas/${dadosLoja.id}`);
    const { deleteData } = useDeleteData(`/lojas/${dadosLoja.id}`);

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
            setDadosLoja({ id: '', descricao: '', email: '', telefone: '', qtdVeiculos: '' });
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
                qtdVeiculos: dados.qtdVeiculos ?? dados.qntVeiculos ?? ''
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

        if (!dadosLoja.id) {
            window.alert('Nenhuma loja selecionada para edição.');
            return;
        }

        const dadosPayload = {
            id: dadosLoja.id,
            descricao: dadosLoja.descricao,
            telefone: dadosLoja.telefone,
            email: dadosLoja.email,
            qtdVeiculos: dadosLoja.qtdVeiculos
        };

        const dadosUpper = toUpperFields(dadosPayload, ['descricao']);

        const confirmar = window.confirm("Confirma a edição do cadastro da loja?");
        if (!confirmar) return;
        if (dadosLoja.qtdVeiculos === '' || isNaN(dadosLoja.qtdVeiculos)) {
            window.alert('Quantidade de veículos deve ser um número válido.');
            return;
        }

        try {
            // ajuste conforme assinatura do seu hook
            await updateData(dadosUpper, dadosLoja.id);
            window.alert('Cadastro editado com sucesso');
            resetForm()
        } catch (err) {
            console.error('Falha ao editar cadastro: ', err);
            window.alert('Falha ao editar o cadastro da loja.\nEntre em contato com o suporte.');
        }
    };

    const handleDelete = async (e) => {
        e.preventDefault()

        if (!dadosLoja.id) {
            window.alert('Nenhuma loja selecionada para exclusão.');
            return;
        }

        const confirmar = window.confirm("Confirma a exclusão da loja " + dadosLoja.descricao + "?")
        if (!confirmar) {
            return
        } else {
            try {
                await deleteData(dadosLoja.id)
                window.alert("Loja excluída com sucesso")
                setDadosLoja({ id: '', descricao: '', email: '', telefone: '', qtdVeiculos: '' })
                setEditavel(false)
                resetForm()
            } catch {
                window.alert("Não foi possível excluir a loja.\nEntre em contato com o suporte.")
            }
        }
    }

    return (
        <div>
            <div className='panel-heading'>
                <i className='ti ti-home' id="ti-black"></i>
                <p>EDITAR LOJA <br /> Informe os dados e selecione o que deseja editar</p>
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
        </div>
    );
};

export default EditarCadastroLoja;
