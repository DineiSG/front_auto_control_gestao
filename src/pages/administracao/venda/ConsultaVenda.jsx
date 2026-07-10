import ContainerSecundario from '../../../components/container/ContainerSecundario'
import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import Box from '../../../components/box/Box';
import Input from '../../../components/input/Input';
import Form from '../../../components/form/Form';
import { useState, useEffect, useRef } from "react";
import { useGetData } from '../../../services/useGetData';
import { useUpdateData } from '../../../services/useUpdateData';
import { useDeleteData } from '../../../services/useDeleteData';
import { formatDateInfo } from '../../../hooks/formatDate';
import Button from '../../../components/button/Button';
import { formatTel, formatCEP, formatCPF, formatDate, formatValue } from "../../../hooks/useMask"
import { calcValorFinanceiro } from '../../../hooks/useCalc';

const ConsultaVenda = () => {

    const [placa, setPlaca] = useState('')
    const [buscaPlaca, setBuscaPlaca] = useState("")
    const [editavel, setEditavel] = useState(false)
    const [dadosVeiculo, setDadosVeiculo] = useState({
        id: '', marca: '', modelo: '', cor: '', renavan: '', unidade: '', vendedor: '',
        comprador: '', telefone: '', email: '', cep: '', endereco: '', bairro: '', cidade: '', uf: '', nascimento: '', cpf: '', rg: '',
        valorFipe: '', valorVenda: '', valorEntrada: '', valorFinanciamento: '', observacoes: '', tipoVenda: '', instituicao: '', dataRegistro: '', rua: ''
    })

    const resetForm = () => {
        setDadosVeiculo({
            id: '', marca: '', modelo: '', cor: '', renavan: '', unidade: '', vendedor: '',
            comprador: '', telefone: '', email: '', cep: '', endereco: '', bairro: '', cidade: '', uf: '', nascimento: '', cpf: '', rg: '',
            valorFipe: '', valorVenda: '', valorEntrada: '', valorFinanciamento: '', observacoes: '', tipoVenda: '', instituicao: '', dataRegistro: '', rua: ''
        })
        ultimaPlacaBuscada.current = ''
    }

    //Calcula o valor financiado
    useEffect(() => {
        const resultado = calcValorFinanceiro(dadosVeiculo.valorVenda, dadosVeiculo.valorEntrada);
        setDadosVeiculo(prev => ({ ...prev, valorFinanciamento: resultado }));
    }, [dadosVeiculo.valorVenda, dadosVeiculo.valorEntrada])

    // buscando os dados no bd
    const { data: veiculo } = useGetData(buscaPlaca ? `/vendas/placa/${placa}` : null)

    // Enviando dados editados
    const { updateData } = useUpdateData(`/vendas/${dadosVeiculo.id}`)

    const { deleteData } = useDeleteData(`/vendas`)

    // Ref para manter a referência atualizada da última placa buscada
    const ultimaPlacaBuscada = useRef('');

    // Função chamada quando o input da placa perde o foco
    const handleBlur = () => {

        const placaM = placa

        if (placaM.length === 7) {
            // Só busca se a placa for diferente da última buscada
            if (placaM !== ultimaPlacaBuscada.current) {
                console.log('Buscando placa:', placaM); // Debug
                ultimaPlacaBuscada.current = placaM;
                setBuscaPlaca(placaM);
            }
            setEditavel(true);
        } else {
            setDadosVeiculo({
                placa: '', marca: '', modelo: '', cor: '', renavan: '', unidade: '', vendedor: '',
                comprador: '', telefone: '', email: '', cep: '', endereco: '', bairro: '', cidade: '', uf: '', nascimento: '', cpf: '', rg: '',
                valorFipe: '', valorVenda: '', valorEntrada: '', valorFinanciamento: '', observacoes: '', tipoVenda: '', instituicao: '', rua: ''
            });
        }
    };

    // Preencher campos quando os dados solicitados chegarem
    useEffect(() => {
        if (veiculo && !veiculo.erro) {
            console.log('Dados do veículo recebidos:', veiculo); // Debug
            setDadosVeiculo(prev => ({
                ...prev,
                id: veiculo.id || '',
                marca: veiculo.marca || '',
                modelo: veiculo.modelo || '',
                cor: veiculo.cor || '',
                renavan: veiculo.renavam || '',
                unidade: veiculo.unidade || '',
                vendedor: veiculo.vendedor || '',
                comprador: veiculo.comprador || '',
                telefone: veiculo.telefone || '',
                email: veiculo.email || '',
                cep: veiculo.cep || '',
                endereco: veiculo.endereco || '',
                bairro: veiculo.bairro || '',
                cidade: veiculo.cidade || '',
                uf: veiculo.uf || '',
                nascimento: veiculo.nascimento || '',
                rua: veiculo.rua || '',
                cpf: veiculo.cpf || '',
                rg: veiculo.rg || '',
                valorFipe: veiculo.valorFipe || '',
                valorVenda: veiculo.valorVenda || '',
                valorEntrada: veiculo.valorEntrada || '',
                valorFinanciamento: veiculo.valorFinanciamento || '',
                observacoes: veiculo.observacoes || '',
                tipoVenda: veiculo.tipoVenda || '',
                instituicao: veiculo.instituicao || '',
                dataRegistro: veiculo.dataRegistro ? formatDateInfo(veiculo.dataRegistro) : ''
            }));
        } else if (veiculo && veiculo.erro) {
            console.log('Veículo não encontrado');;
        }

    }, [veiculo]);

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

    const handleDateChange = (e) => {
        const formatted = formatDate(e.target.value)
        setDadosVeiculo(prev => ({ ...prev, nascimento: formatted }))
    }

    // formata telefone enquanto digita
    const handlePhoneChange = (e) => {
        const formatted = formatTel(e.target.value);
        setDadosVeiculo(prev => ({ ...prev, telefone: formatted }));
    };
    // formata cep enquanto digita
    const handleCepChange = (e) => {
        const formatted = formatCEP(e.target.value)
        setDadosVeiculo(prev => ({ ...prev, cep: formatted }))
    }
    // formata cpf enquanto digita
    const handleCpfChange = (e) => {
        const formatted = formatCPF(e.target.value)
        setDadosVeiculo(prev => ({ ...prev, cpf: formatted }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        let dados = {
            placa, id: dadosVeiculo.id, marca: dadosVeiculo.marca, modelo: dadosVeiculo.modelo, cor: dadosVeiculo.cor, renavam: dadosVeiculo.renavan,
            unidade: dadosVeiculo.unidade, ano_fabricacao: dadosVeiculo.ano_fabricacao, ano_modelo: dadosVeiculo.ano_modelo, vendedor: dadosVeiculo.vendedor,
            comprador: dadosVeiculo.comprador, telefone: dadosVeiculo.telefone, email: dadosVeiculo.email, cep: dadosVeiculo.cep,
            endereco: dadosVeiculo.endereco, bairro: dadosVeiculo.bairro, cidade: dadosVeiculo.cidade, uf: dadosVeiculo.uf, valorVenda: dadosVeiculo.valorVenda,
            valorFipe: dadosVeiculo.valorFipe, valorEntrada: dadosVeiculo.valorEntrada, valorFinanciamento: dadosVeiculo.valorFinanciamento,
            observacoes: dadosVeiculo.observacoes, tipoVenda: dadosVeiculo.tipoVenda, instituicao: dadosVeiculo.instituicao,
            nascimento: dadosVeiculo.nascimento, cpf: dadosVeiculo.cpf, rg: dadosVeiculo.rg, rua: dadosVeiculo.rua
        }

        dados = toUpperFields(dados, ['placa', 'marca', 'modelo', 'cor', 'unidade', 'vendedor', 'comprador', 'cidade', 'uf', 'bairro', 'endereco', 'instituicao', 'tipoVenda'])
        // Padroniza para caixa alta
        console.log('Dados a serem enviados: ', dados)

        const confirmar = window.confirm("Confirma a edição dos dados da venda do veículo?");

        if (confirmar === true) {
            try {
                const resultado = await updateData(dados, dadosVeiculo.id)
                console.log('Dados editados com sucesso, ', resultado)
                window.alert('Dados editados com sucesso')
                resetForm()


            } catch (err) {
                console.log(err)
                window.alert("Falha ao editar o Registro de Venda.\nEntre em contato com o suporte.")
            }
        }

    }
    const handleDelete = async (e) => {
        e.preventDefault()

        let dados = {
            placa, id: dadosVeiculo.id, marca: dadosVeiculo.marca, modelo: dadosVeiculo.modelo, cor: dadosVeiculo.cor, renavam: dadosVeiculo.renavan,
            unidade: dadosVeiculo.unidade, ano_fabricacao: dadosVeiculo.ano_fabricacao, ano_modelo: dadosVeiculo.ano_modelo, vendedor: dadosVeiculo.vendedor,
            comprador: dadosVeiculo.comprador, telefone: dadosVeiculo.telefone, email: dadosVeiculo.email, cep: dadosVeiculo.cep,
            endereco: dadosVeiculo.endereco, bairro: dadosVeiculo.bairro, cidade: dadosVeiculo.cidade, uf: dadosVeiculo.uf, valorVenda: dadosVeiculo.valorVenda,
            valorFipe: dadosVeiculo.valorFipe, valorEntrada: dadosVeiculo.valorEntrada, valorFinanciamento: dadosVeiculo.valorFinanciamento,
            observacoes: dadosVeiculo.observacoes, tipoVenda: dadosVeiculo.tipoVenda, instituicao: dadosVeiculo.instituicao,
            nascimento: dadosVeiculo.nascimento, cpf: dadosVeiculo.cpf, rg: dadosVeiculo.rg, rua: dadosVeiculo.rua, dataRegistro: dadosVeiculo.dataRegistro
        }

        const confirmar = window.confirm("Confirma a exclusao do registro de venda?");

        if (confirmar === true) {
            try {
                const resultado = await deleteData(dados.placa)
                console.log('Registro excluido com sucesso, ', resultado)
                window.alert('Registro de Venda excluido com sucesso')
                resetForm()

            } catch (err) {
                console.log(err)
                window.alert("Não foi possivel excluir o Registro de Venda.\nFavor entrar em contato com o suporte.")
            }
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
                        <a className="link_a" href="/administracao">Administração</a>
                    </div>
                    <div className="p-2">
                        <i className=' ti ti-angle-right ' id='card-path' />
                    </div>
                    <div className="p-2">
                        <p className='atual'>Consultar Venda </p>
                    </div>
                </div>
            </div>
            <div className="container d-flex justify-content-center card-container">
                <Box onSubmit>

                    <div className='panel-heading'>
                        <i className='ti ti-car' id="ti-black" ></i>
                        <p>DADOS DO VEÍCULO</p>
                    </div>
                    <div className='panel-heading'>
                        <p>Informe uma placa para buscar os dados da venda de um veículo</p>
                    </div>
                    <Form onSubmit={handleSubmit}>
                        <div className="col-12 col-md-2">
                            <Input label={"Placa:"} type={"text"} maxLength={"7"} style={{ width: '80px' }} nameInput={"placa"} value={placa} onChange={(e) => setPlaca(e.target.value)} onBlur={handleBlur} required />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Marca:"} type={"text"} style={{ width: '150px' }} nameInput={"marca"} value={dadosVeiculo.marca} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Modelo:"} type={"text"} style={{ width: '150px' }} nameInput={"modelo"} value={dadosVeiculo.modelo} readOnly />
                        </div>
                        <div className="col-12 col-md-4">
                            <Input label={"Cor:"} type={"text"} style={{ width: '150px' }} nameInput={"cor"} value={dadosVeiculo.cor} readOnly />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Renavam:"} type={"text"} style={{ width: '150px' }} nameInput={"renavam"} value={dadosVeiculo.renavan} readOnly />
                        </div>
                        <div className="col-12 col-md-6">
                            <Input label={"Loja:"} type={"text"} style={{ width: '150px' }} nameInput={"unidade"} value={dadosVeiculo.unidade} readOnly />
                        </div>
                    </Form>
                    <div className='sub-panel-heading'>
                        <i className='ti ti-user' id="ti-black"></i>
                        <p>DADOS DO COMPRADOR</p>
                    </div>
                    <Form>
                        <div className="col-6 col-md-5">
                            <Input label={"Nome Completo:"} type={"text"} style={{ width: '250px' }} nameInput={"comprador"} value={dadosVeiculo.comprador} readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, comprador: e.target.value }))} />
                        </div>
                        <div className="col-6 col-md-4">
                            <Input label={"Data de Nascimento:"} style={{ width: '110px' }} value={dadosVeiculo.nascimento} required readOnly={!editavel} onChange={handleDateChange} />
                        </div>
                        <div className="col-6 col-md-3">
                            <Input label={"CPF:"} type={"text"} style={{ width: '150px' }} maxLength={14} nameInput={"cpf"} value={dadosVeiculo.cpf} required onChange={handleCpfChange} />
                        </div>
                        <div className="col-6 col-md-3">
                            <Input label={"RG:"} type={"text"} style={{ width: '150px' }} maxLength={14} nameInput={"rg"} value={dadosVeiculo.rg} required readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, rg: e.target.value }))} />
                        </div>
                        <div className="col-6 col-md-3">
                            <Input label={"Telefone:"} type={"text"} style={{ width: '150px' }} maxLength={14} nameInput={"telefone"} value={dadosVeiculo.telefone} readOnly={!editavel} onChange={handlePhoneChange} />
                        </div>
                        <div className="col-6 col-md-3">
                            <Input label={"Email:"} type={"text"} style={{ width: '200px' }} nameInput={"email"} value={dadosVeiculo.email} required readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, email: e.target.value }))} />
                        </div>
                        <div className="col-6 col-md-4">
                            <Input label={"CEP:"} type={"text"} style={{ width: '100px' }} maxLength={9} nameInput={"cep"} value={dadosVeiculo.cep} required readOnly={!editavel} onChange={handleCepChange} />
                        </div>
                        <div className="col-6 col-md-4">
                            <Input label={"Logradouro:"} type={"text"} style={{ width: '250px' }} nameInput={"logradouro"} value={dadosVeiculo.rua} readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, rua: e.target.value }))} />
                        </div>
                        <div className="col-6 col-md-4">
                            <Input label={"Complemento:"} type={"text"} style={{ width: '200px' }} nameInput={"complemento"} value={dadosVeiculo.endereco} required readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, endereco: e.target.value }))} />
                        </div>
                        <div className="col-6 col-md-4">
                            <Input label={"Bairro:"} type={"text"} style={{ width: '200px' }} nameInput={"bairro"} value={dadosVeiculo.bairro} readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, bairro: e.target.value }))} />
                        </div>
                        <div className="col-12 col-md-4">
                            <Input label={"Cidade:"} type={"text"} style={{ width: '200px' }} nameInput={"cidade"} value={dadosVeiculo.cidade} readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, cidade: e.target.value }))} />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"UF:"} type={"text"} style={{ width: '70px' }} nameInput={"uf"} value={dadosVeiculo.uf} readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, uf: e.target.value }))} />
                        </div>
                    </Form>
                    <div className='sub-panel-heading'>
                        <i className='ti ti-money' id="ti-black"></i>
                        <p>DADOS DA TRANSAÇÃO </p>
                    </div>
                    <Form>
                        <div className='col-12 col-md-4' id='select-all'>
                            <Input label={"Tipo de Venda:"} type={"text"} style={{ width: '200px' }} nameInput={"tipoVenda"} value={dadosVeiculo.tipoVenda} readOnly />
                        </div>
                        <div className='col-12 col-md-4' id='select-all'>
                            <Input label={"Vendedor:"} type={"text"} style={{ width: '200px' }} nameInput={"vendedor"} value={dadosVeiculo.vendedor} readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, vendedor: e.target.value }))} />
                        </div>
                        <div className="col-12 col-md-3">
                            <Input label={"Valor Fipe R$:"} type={"text"} style={{ width: '150px' }} nameInput={"valor_fipe"} value={dadosVeiculo.valorFipe} readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, valorFipe: formatValue(e.target.value) }))} />
                        </div>
                        <div className="col-12 col-md-4">
                            <Input label={"Valor Venda R$:"} type={"text"} style={{ width: '150px' }} nameInput={"valor_venda"} value={dadosVeiculo.valorVenda} readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, valorVenda: formatValue(e.target.value) }))} />
                        </div>
                        <div className="col-12 col-md-4">
                            <Input label={"Valor Entrada R$:"} type={"text"} style={{ width: '150px' }} nameInput={"valor_entrada"} value={dadosVeiculo.valorEntrada} readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, valorEntrada: formatValue(e.target.value) }))} />
                        </div>
                        <div className="col-12 col-md-4">
                            <Input label={"Valor Financiado R$:"} type={"text"} style={{ width: '150px' }} nameInput={"valor_financiado"} value={dadosVeiculo.valorFinanciamento} readOnly={!editavel}
                                onChange={(e) => setDadosVeiculo(prev => ({ ...prev, valorFinanciamento: formatValue(e.target.value) }))} />
                        </div>
                        <div className="col-12 col-md-6">
                            <Input label={"Data transação:"} type={"text"} style={{ width: '200px' }} nameInput={"dataTransação"} value={dadosVeiculo.dataRegistro} required readOnly />
                        </div>
                        <div className="col-12 col-md-6">
                            <Input label={"Observações:"} type={"text"} style={{ width: '300px' }} nameInput={"observacoes"} value={dadosVeiculo.observacoes} required readOnly={!editavel} onChange={(e) =>
                                setDadosVeiculo(prev => ({ ...prev, observacoes: e.target.value }))} />
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="d-flex flex-row-start">
                                <Button onClick={handleDelete} variant='danger' >EXCLUIR</Button>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="d-flex flex-row-reverse">
                                <Button onClick={handleSubmit} variant='primary' >SALVAR</Button>
                            </div>
                        </div>

                    </Form>
                </Box>

            </div>

        </ContainerSecundario>
    )
}

export default ConsultaVenda
