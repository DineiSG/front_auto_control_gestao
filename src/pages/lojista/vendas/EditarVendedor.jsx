import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css";
import Form from '../../../components/form/Form';
import Input from '../../../components/input/Input';
import Button from '../../../components/button/Button';
import { useState, useRef, useEffect } from 'react';
import { useGetData } from '../../../services/useGetData';
import { formatTel } from "../../../hooks/useMask";
import { useAuth } from "../../../hooks/useAuth"
import { useUpdateData } from "../../../services/useUpdateData";

const EditarVendedor = () => {

    // Base URL da API
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    const [buscaVendedor, setBuscaVendedor] = useState('');
    // estado local com todos os campos
    const [dadosVendedor, setDadosVendedor] = useState({ id: '', nome: '', email: '', telefone: '', unidade: '' });

    const { user } = useAuth()
    const usuarioAtivo = user?.nome.split('.').toString()
    console.log('Usuário ativo: ', usuarioAtivo)

    // busca os dados quando houver termo
    const { data: dados, loading } = useGetData(
        buscaVendedor ? `/vendedor/nome/${encodeURIComponent(buscaVendedor)}` : null
    );

    const { updateData } = useUpdateData(`/vendedor/${dadosVendedor.id}`)

    // para evitar buscas repetidas na API
    const ultimoVendedor = useRef('');

    // dispara busca quando sai do campo (blur)
    const handleBlur = async () => {

        try {

            const lojaVendedor = await fetch(`${API_BASE_URL}/vendedor/nome/${dadosVendedor.nome}`);

            const dados = await lojaVendedor.json()
            console.log(`Dados do vendedor: ${dados}`)
            if (dados.unidade !== usuarioAtivo) {
                window.alert("este vendedor nao esta cadastrado nessa unidade. Operação nao permitida.")
                window.location.reload()
            }

            const term = dadosVendedor.nome.trim();
            if (term) {
                if (term !== ultimoVendedor.current) {
                    ultimoVendedor.current = term;
                    setBuscaVendedor(term); // dispara fetch
                }
            } else {
                setDadosVendedor({ id: '', nome: '', email: '', telefone: '', unidade: '', status: '' });
            }
        } catch {
            window.alert("Nao foi possivel consultar os dados do vendedor solicitado. Entre em contato com o suporte.")
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
                unidade: dados.unidade ?? '',
                status:dados.status?? ''
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


    const handleStatus = async (e) => {
        e.preventDefault()

        if (!dadosVendedor.id) {
            window.alert('Nenhum vendedor selecionado para exclusão.');
            return;
        }

        const statusVendedor={
            id:dadosVendedor.id,
            status:"INATIVO"
        }

        const confirmar = window.confirm("Confirma a exclusão do vendedor " + dadosVendedor.nome + "?")
        if (!confirmar) {
            return
        } else {
            try {
                await updateData(statusVendedor, dadosVendedor.id)
                window.alert("Vendedor excluído com sucesso")
                window.location.reload()
            } catch {
                window.alert("Não foi possível excluir o vendedor.\nEntre em contato com o suporte.")
            }
        }
    }

    return (
        <div>
            <div className='panel-heading'>
                <i className='ti ti-close' id="ti-black"></i>
                <p>EXCLUIR VENDEDOR <br /> Informe o nome do vendedor</p>
            </div>
            <Form onSubmit={handleStatus}>
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
                        <Button type="submit" variant='danger' onClick={handleStatus}>
                            {loading && (
                                <div className="d-flex flex-row-start" role="status" > </div>
                            )}
                            EXCLUIR
                        </Button>
                    </div>
                </div>
            </Form>
        </div>
    )
}

export default EditarVendedor
