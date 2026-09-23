import ContainerSecundario from '../../../components/container/ContainerSecundario'
import "../../../assets/css/thead.css";
import "../../../assets/css/themify-icons.css"
import Box from '../../../components/box/Box';
import Input from '../../../components/input/Input';
import Form from '../../../components/form/Form';
import Button from '../../../components/button/Button';
import { formatCPF, formatCEP, formatDate, formatTel, formatValue } from "../../../hooks/useMask"
import { useState, useEffect, useRef } from "react";
import { useGetData } from '../../../services/useGetData';
import { usePostData } from '../../../services/usePostData';
import { calcValorFinanceiro } from '../../../hooks/useCalc';
import { formatTimestamp } from '../../../hooks/formatDate';
import { useGetExtern } from '../../../services/useGetExtern';
import { useAuth } from "../../../hooks/useAuth"


const RegistrarVenda = () => {

  const [placa, setPlaca] = useState('')
  const [comprador, setComprador] = useState('')
  const [nascimento, setNascimento] = useState("")
  const [cpf, setCpf] = useState("")
  const [rg, setRg] = useState('')
  const [telefone, setTelefone] = useState("")
  const [email, setEmail] = useState('')
  const [cep, setCep] = useState("")
  const [endereco, setEndereco] = useState('')
  const [valorFipe, setValorFipe] = useState('')
  const [valorVenda, setValorVenda] = useState('')
  const [valorFinanciamento, setValorFinanciamento] = useState('')
  const [valorEntrada, setValorEntrada] = useState('')
  const [instituicao, setInstituicao] = useState('')
  const [condicoes, setCondicoes] = useState(false)
  const [tipoVenda, setTipoVenda] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [buscaPlaca, setBuscaPlaca] = useState("")
  const [dadosVeiculo, setDadosVeiculo] = useState({ placa: '', marca: '', modelo: '', cor: '', renavam: '', unidade: '' })
  const [dadosCEP, setDadosCEP] = useState({ cep: '', rua: '', cidade: '', bairro: '', uf: '' })
  const [vendedor, setVendedor] = useState('')
  const [idVendedor, setIdVendedor] = useState('')


  //Limpa o formulario apos o envio
  const resetForm = () => {
    setPlaca(''); setComprador(''); setNascimento(''); setCpf(''); setRg(''); setTelefone(''); setEmail(''); setCep(''); setEndereco(''); setValorFipe('');
    setValorVenda(''); setValorEntrada(''); setInstituicao(''); setCondicoes(false); setTipoVenda(''); setObservacoes(''); setBuscaPlaca('');
    setDadosVeiculo({ placa: '', marca: '', modelo: '', cor: '', renavam: '', unidade: '' });
    setDadosCEP({ cep: '', rua: '', cidade: '', bairro: '', uf: '' });
    setVendedor({ nome: '', unidade: '' });
    ultimaPlacaBuscada.current = ''; // também reseta a ref
  };

  // Base URL da API
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  //Usuario autenticado
  const { user } = useAuth()
  const usuarioAtivo = user?.nome.split('.').toString()
  console.log('Usuário ativo: ', usuarioAtivo)

  // buscando os dados no bd
  const { data: veiculo } = useGetData(buscaPlaca ? `/veiculos/placa/${placa}` : null)

  const { data: dadosPostais } = useGetExtern(cep ? `https://brasilapi.com.br/api/cep/v2/${cep}` : null)

  const { createData, loading } = usePostData('/vendas');

  // Só busca o vendendor se soubermos a loja:
  const { data: vendedoresLoja } = useGetData(usuarioAtivo ? `/vendedor/unidade/${encodeURIComponent(usuarioAtivo)}` : null);




  // Ref para manter a referência atualizada da última placa buscada
  const ultimaPlacaBuscada = useRef('');

  // Função chamada quando o input da placa perde o foco
  const handleBlur = async () => {

    const placaM = placa.trim().toUpperCase();
    console.log(`Placa buscada: ${placaM}`);

    if (placaM.length !== 7) return;

    if (placaM === ultimaPlacaBuscada.current) return;

    ultimaPlacaBuscada.current = placaM;

    // Verificaçao e busca de dados de veiculo
    try {

      const lojaVeiculo = await fetch(`${API_BASE_URL}/veiculos/placa/${placaM}`);

      const dados = await lojaVeiculo.json()
      console.log(`Dados do veículo: ${dados}`)

      if (dados.unidade !== usuarioAtivo) {
        window.alert("O veiculo correspondente a essa placa nao pertence a essa unidade. Operação nao permitida.")
        window.location.reload()
      }

      // 1 Verifica se a placa existe em vendas
      const resVenda = await fetch(`${API_BASE_URL}/vendas/placa/${placaM}`);

      if (resVenda.status === 200) {
        // Já vendida → limpar e bloquear
        window.alert('Ja consta uma venda registrada para esta placa. Para confirmar os dados, acesse Consultar Venda.');

        setDadosVeiculo({ placa: '', marca: '', modelo: '', cor: '', renavam: '', unidade: '' });
        setBuscaPlaca(placaM);
        // Opcional: exibir mensagem ao usuário
        return;
      } else if (resVenda.status !== 404) {
        throw new Error(`Erro na API de vendas: ${resVenda.status}`);
      }

      // 2. Busca veículo SOMENTE se não estiver vendida
      const resVeiculo = await fetch(`${API_BASE_URL}/veiculos/placa/${placaM}`);

      if (resVeiculo.status === 200) {
        const dados = await resVeiculo.json();

        setDadosVeiculo({
          placa: dados.placa || placaM,
          marca: dados.marca || '',
          modelo: dados.modelo || '',
          cor: dados.cor || '',
          renavam: dados.renavam || dados.renavan || '', // cobre ambos os nomes
          unidade: dados.unidade || ''
        });
      } else {
        // Veículo não encontrado
        setDadosVeiculo({ placa: '', marca: '', modelo: '', cor: '', renavam: '', unidade: '' });
      }

      setBuscaPlaca(placaM);

    } catch (erro) {
      console.error('Erro ao buscar placa:', erro);
      setDadosVeiculo({ placa: '', marca: '', modelo: '', cor: '', renavam: '', unidade: '' });
      setBuscaPlaca(placaM);
    }
  };

  // Preencher campos quando os dados solicitados chegarem
  useEffect(() => {

    if (veiculo && !veiculo.erro) {
      // Debug
      setDadosVeiculo(prev => ({
        ...prev,
        marca: veiculo.marca || '',
        modelo: veiculo.modelo || '',
        cor: veiculo.cor || '',
        renavam: veiculo.renavan || '',
        unidade: veiculo.unidade || ''
      }));
    } else if (veiculo && veiculo.erro) {
      console.log('Veículo não encontrado');;
    }

    //Obtendo os dados postais
    if (dadosPostais && !dadosPostais.erro) {
      //console.log('Dados postais recebidos: ', dadosPostais);
      const ruaTruncada = dadosPostais.street ? dadosPostais.street.substring(0, 30) : '';
      setDadosCEP(prev => ({
        ...prev,
        cep: dadosPostais.cep,
        rua: ruaTruncada,
        cidade: dadosPostais.city,
        uf: dadosPostais.state,
        bairro: dadosPostais.neighborhood,
      }))
    } else if (dadosPostais && dadosPostais.erro) {
      //console.log("Endereço nao encontrado ou CEP inválido")
    }

    //Obtendo os dados do vendedor
    if (vendedoresLoja && !vendedoresLoja.erro) {
      console.log('Dados do vendedor recebidos: ', vendedoresLoja)
      setVendedor(prev => ({
        ...prev,
        id: vendedoresLoja.id,
        nome: vendedoresLoja.nome,
        unidade: vendedoresLoja.unidade
      }))
    }


  }, [veiculo, dadosPostais, vendedoresLoja]);

  //Calcula o valor financiado
  useEffect(() => {
    const resultado = calcValorFinanceiro(valorVenda, valorEntrada);
    setValorFinanciamento(resultado);
  }, [valorVenda, valorEntrada])

  //Valida se a venda e à vista. Caso nao seja, os inputs de entrada e valor financiado sao liberados
  const handleVendaChange = (e) => {
    setTipoVenda(e.target.value)
    if (e.target.value === 'aVista') {
      setCondicoes(false)
      setInstituicao("A Vista")
    } else {
      setCondicoes(true)
    }
  }

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

  //Dados que serao obtidos da tabela veiculo (retornando como veiculo.dado), e serao enviados à tabela vendas
  const handleSubmit = async (e) => {
    e.preventDefault()

    const dataRegistro = formatTimestamp(new Date())

    let dados = {
      placa, id: veiculo.id, marca: veiculo.marca, modelo: veiculo.modelo, cor: veiculo.cor, unidade: veiculo.unidade,
      renavam: veiculo.renavan, comprador, vendedor, nascimento, rg, cpf, telefone, email, cep: dadosPostais.cep, rua: dadosCEP.rua,
      endereco, bairro: dadosPostais.neighborhood, cidade: dadosPostais.city, uf: dadosPostais.state, id_vendedor:idVendedor,
      valorVenda, valorFipe, valorFinanciamento, valorEntrada, tipoVenda, instituicao, dataRegistro, observacoes, audit: user?.nome
    }

    // Padroniza para caixa alta
    dados = toUpperFields(dados, ['placa', 'marca', 'modelo', 'cor', 'unidade', 'comprador', 'vendedor', 'endereco', 'bairro', 'rua', 'cidade', 'uf',
      'instituicao', 'tipoVenda', 'observacoes'
    ])

    const confirmou = window.confirm("Confirma o registro da venda?")
    if (!confirmou) {
      window.alert('Registro de venda cancelado')
      return
    }

    console.log('Dados a serem enviados: ', dados)

    // Validação simples dos campos obrigatórios
    if (!window.confirm.ok && comprador === "" || cpf === "" || rg === "" || telefone === "" || email === "" || cep === "" || endereco === "" || valorFipe === "" ||
      valorVenda === "" || tipoVenda === "") {
      window.alert("Por favor, verifique o formulario novamente e preencha todos os campos")
    } else {
      try {
        const resultado = await createData(dados)
        console.log('Venda cadastrada com sucesso, ', resultado)
        window.alert('Venda registrada com sucesso')
        resetForm() //Chama a função que limpa o formulario
        window.scrollTo({ top: 0, behavior: 'smooth' });//Retorna a pagina para o topo
      } catch (err) {
        window.alert("Não foi possivel realizar o Registro de Venda.\nFavor entrar em contato com o suporte.")
        console.error('Falha ao registrar a venda: ', err)
      }
    }
  }

  // Função para lidar com a mudança de unidade
  const handleVendedorChange = (e) => {
    const optionSelecionada = e.target.options[e.target.selectedIndex];
    setVendedor(optionSelecionada.value);
    setIdVendedor(optionSelecionada.dataset.id || '');

  }

  return (
    <ContainerSecundario>

      <div className='container d-flex flex-column ' id="path" >
        <div className="d-flex align-items-start ">
          <div className="p-2">
            <a className="link_a" href="/home">Início</a>
          </div>
          <div className="p-2">
            <i className=' ti ti-angle-right ' id='card-path' />
          </div>
          <div className="p-2">
            <a className="link_a" href="/lojista/">Lojista</a>
          </div>
          <div className="p-2">
            <i className=' ti ti-angle-right ' id='card-path' />
          </div>
          <div className="p-2">
            <p className='atual'>Registrar Venda </p>
          </div>
        </div>
      </div>
      <div className="container d-flex justify-content-center card-container">
        <Box onSubmit={handleSubmit}>
          <div className='panel-heading'>
            <i className='ti ti-car' id="ti-black" ></i>
            <p>REGISTRAR A VENDA DE UM VEÍCULO <br /> Informe os dados do veículo</p>
          </div>
          <Form >

            <div className="col-12 col-md-2">
              <Input label={"Placa:"} type={"text"} maxLength={"7"} style={{ width: '80px' }} nameInput={"placa"}
                value={placa} onChange={(e) => setPlaca(e.target.value)} onBlur={handleBlur} required />
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
              <Input label={"Renavam:"} type={"text"} style={{ width: '150px' }} nameInput={"renavam"} value={dadosVeiculo.renavam} readOnly />
            </div>
            <div className="col-12 col-md-6">
              <Input label={"Loja:"} type={"text"} style={{ width: '150px' }} nameInput={"unidade"} value={dadosVeiculo.unidade} readOnly />
            </div>
          </Form>
          <div className='sub-panel-heading'>
            <i className='ti ti-user' id="ti-black"></i>
            <p>DADOS DO COMPRADOR <br /> Informe os dados do comprador</p>
          </div>
          <Form>
            <div className="col-6 col-md-5">
              <Input label={"Nome Completo:"} type={"text"} style={{ width: '250px' }} nameInput={"comprador"} value={comprador}
                onChange={(e) => setComprador(e.target.value)} required />
            </div>
            <div className="col-6 col-md-4">
              <Input label={"Data de Nascimento:"} style={{ width: '110px' }} value={nascimento}
                nameInput={"data"} onChange={(e) => setNascimento(formatDate(e.target.value))} placeholder={"dd/mm/aaaa"} required />
            </div>
            <div className="col-6 col-md-3">
              <Input label={"CPF:"} type={"text"} style={{ width: '150px' }} maxLength={14}
                nameInput={"modelo"} value={cpf} onChange={(e) => setCpf(formatCPF(e.target.value))} placeholder={"XXX.XXX.XXX-XX"} required />
            </div>
            <div className="col-6 col-md-3">
              <Input label={"RG:"} type={"text"} style={{ width: '150px' }} maxLength={14}
                nameInput={"rg"} value={rg} onChange={(e) => setRg(e.target.value)} required />
            </div>
            <div className="col-6 col-md-3">
              <Input label={"Telefone:"} type={"text"} style={{ width: '150px' }} maxLength={14}
                nameInput={"telefone"} value={telefone} onChange={(e) => setTelefone(formatTel(e.target.value))} placeholder={"(XX)XXXXX-XXXX"} required />
            </div>
            <div className="col-6 col-md-3">
              <Input label={"Email:"} type={"text"} style={{ width: '200px' }} nameInput={"email"} value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="col-6 col-md-4">
              <Input label={"CEP:"} type={"text"} style={{ width: '100px' }} maxLength={9}
                nameInput={"cep"} value={cep} onChange={(e) => setCep(formatCEP(e.target.value))} onBlur={handleBlur} required />
            </div>
            <div className="col-6 col-md-4">
              <Input label={"Logradouro:"} type={"text"} style={{ width: '250px' }}
                nameInput={"logradouro"} value={dadosCEP.rua} readOnly />
            </div>
            <div className="col-6 col-md-4">
              <Input label={"Complemento:"} type={"text"} style={{ width: '200px' }} nameInput={"complemento"} value={endereco}
                onChange={(e) => setEndereco(e.target.value)} required />
            </div>
            <div className="col-6 col-md-4">
              <Input label={"Bairro:"} type={"text"} style={{ width: '200px' }} nameInput={"bairro"} value={dadosPostais.neighborhood} readOnly />
            </div>
            <div className="col-12 col-md-4">
              <Input label={"Cidade:"} type={"text"} style={{ width: '200px' }} nameInput={"cidade"} value={dadosPostais.city} readOnly />
            </div>
            <div className="col-12 col-md-3">
              <Input label={"UF:"} type={"text"} style={{ width: '70px' }} nameInput={"uf"} value={dadosPostais.state} readOnly />
            </div>
          </Form>
          <div className='sub-panel-heading'>
            <i className='ti ti-money' id="ti-black"></i>
            <p>DADOS DA TRANSAÇÃO <br /> Informe os dados da venda</p>
          </div>
          <Form>{/*Select de vendedores */}
            <div className='col-12 col-md-4' id='select-all'>
              <label className="label" id="select-label"><span>Vendedor:</span></label>
              <select type='text' name='loja' value={vendedor} onChange={handleVendedorChange} className="select-item" style={{ width: '250px' }} required >
                <option value="" >SELECIONE UM VENDEDOR</option>
                {vendedoresLoja.map((vendedores) => (
                  <option key={vendedores.id} value={vendedores.nome} data-id={vendedores.id}>
                    {vendedores.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-6">
            </div>
            <br />
            <div className='negociacao'>
              <p>Forma de Negociação: </p>
              <div className="form-check " id="options">
                <Input label={"Financeira"} name={"tipoNegociacao"} className="form-check-input" type={"radio"} checked={tipoVenda === 'financeira'}
                  value={"financeira"} onChange={handleVendaChange} onClick={(e) => setTipoVenda(e.target.value)} />
                {tipoVenda === 'financeira' && (
                  <Input placeholder="Informe a financeira" nameInput={"financeira"} value={instituicao} onChange={(e) => setInstituicao(e.target.value)} required />
                )}
                <Input label={"Banco"} name={"tipoNegociacao"} className="form-check-input" type={"radio"} checked={tipoVenda === 'banco'}
                  value={"banco"} onChange={handleVendaChange} onClick={(e) => setTipoVenda(e.target.value)} />
                {tipoVenda === 'banco' && (
                  <Input placeholder="Informe o banco" nameInput={"banco"} value={instituicao} onChange={(e) => setInstituicao(e.target.value)} required />
                )}
                <Input label={"Consorcio"} name={"tipoNegociacao"} className="form-check-input" type={"radio"} checked={tipoVenda === 'consorcio'}
                  value={"consorcio"} onChange={handleVendaChange} onClick={(e) => setTipoVenda(e.target.value)} />
                {tipoVenda === 'consorcio' && (
                  <Input placeholder="Informe o consórcio" nameInput={"consorcio"} value={instituicao} type={"text"} onChange={(e) => setInstituicao(e.target.value)} required />
                )}
                <Input label={"À Vista"} name={"tipoNegociacao"} className="form-check-input " type={"radio"} checked={tipoVenda === 'aVista'}
                  value={"aVista"} onChange={handleVendaChange} onClick={(e) => setTipoVenda(e.target.value)} />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <Input label={"Valor Fipe R$:"} type={"text"} style={{ width: '150px' }} nameInput={"valor_fipe"} value={valorFipe}
                onChange={(e) => setValorFipe(formatValue(e.target.value))} required />
            </div>
            <div className="col-12 col-md-6">
              <Input label={"Valor Venda R$:"} type={"text"} style={{ width: '150px' }} nameInput={"valor_venda"} value={valorVenda}
                onChange={(e) => setValorVenda(formatValue(e.target.value))} required />
            </div>
            {condicoes && (
              <>
                <div className="col-12 col-md-6">
                  <Input label={"Valor Entrada R$:"} type={"text"} style={{ width: '150px' }} name={"valor_entrada"} value={valorEntrada}
                    onChange={(e) => setValorEntrada(formatValue(e.target.value))} onBlur={handleBlur} required />
                </div>
                <div className="col-12 col-md-6">
                  <Input label={"Valor Financiado R$:"} type={"text"} style={{ width: '150px' }} nameInput={"valor_financiado"}
                    value={valorFinanciamento} onChange={(e) => setValorFinanciamento(e.target.value)} readOnly />
                </div>
              </>
            )}
            <div className="col-6 col-md-12">
              <Input label={"Observações:"} type={"text"} style={{ width: '500px' }} nameInput={"observacoes"}
                value={observacoes} onChange={(e) => setObservacoes(e.target.value)} required />
            </div>
            <div className="col-12 col-md-6">
              <div className="col-6 d-flex flex-row-start">
                {loading && (
                  <div className="spinner-grow spinner-grow-sm flex-row-start" style={{ marginRight: '15px' }} role="status" > </div>
                )}
                <div className="d-flex flex-row-start">
                  <Button onClick={handleSubmit} variant='primary' >ENVIAR</Button>
                </div>
              </div>
            </div>
          </Form>
        </Box>
      </div>
    </ContainerSecundario>
  )
}

export default RegistrarVenda
