/*Essa pagina receberá os componentes de acesso à Dashboard */
import { useState } from 'react'
import ContainerSecundario from '../../../components/container/ContainerSecundario'
import Box from '../../../components/box/Box'
import Marca from './estatisticas/Marca'
import AnoModelo from './estatisticas/AnoModelo'
import Estoque from './estatisticas/Estoque'
import VendaPeriodo from './estatisticas/VendaPeriodo'
import VendaVendedor from './estatisticas/VendaVendedor'
import VendaInstituicao from './estatisticas/VendaInstituicao'
import VendaPeriodoValor from './estatisticas/VendaPeriodoValor'
import VendaInstituicaoQuantidade from './estatisticas/VendaInstituicaoQuantidade'

const Dashboard = () => {

  const [select, setSelect] = useState(false)


  const handleSelectChange = (e) => {
    setSelect(e.target.value);
  }

  return (
    <ContainerSecundario>
      <div className='container d-flex'>
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
              <p className='atual'>Dashboard </p>
            </div>
          </div>
        </div>

      </div>
      <div className="container d-flex justify-content-center card-container" id="graficos">
        <Box >
          <div className='d-flex justify-content-between panel-heading'>
            <div className="d-flex justify-content-start">
              <div className="p-2 ">
                <i className='ti ti-blackboard' id="ti-black" ></i>
              </div>
              <div className="p-2 ">
                <p>DASHBOARD</p>
              </div>
            </div>
            <div className="d-flex justify-content-between">
              <div className="p-2 ">
                <select className="select-item" value={select} onChange={handleSelectChange} id="select-estatisticas">
                  <option value='selecione'>Selecione uma opção</option>
                  <option value='estoque'>Estoque Lojas</option>
                  <option value='marca'>Veiculos Por Marca</option>
                  <option value='ano_modelo'>Veiculos Por Ano Modelo</option>
                  <option value='vendas_periodo'>Vendas Por Loja</option>
                  <option value='vendas_instituicao'>Vendas Por Instituição</option>
                  <option value='vendas_vendedor'>Vendas Por Vendedor</option>
                </select>
              </div>
            </div>
          </div>

          {select === 'estoque' && (
            <div className="container d-flex justify-content-center " >
              <Estoque />
            </div>
          )}
          {select === 'marca' && (
            <div className="container d-flex justify-content-center ">
              <Marca />
            </div>
          )}
          {select == 'ano_modelo' && (
            <div className="container d-flex justify-content-center ">
              <AnoModelo />
            </div>
          )}
          {select === 'vendas_periodo' && (
            <>
              <div className="container d-flex justify-content-center ">
                <VendaPeriodo />
              </div>
              <hr />
              <br />
              <br />
              <div className="container d-flex justify-content-center ">
                <VendaPeriodoValor />
              </div>
            </>

          )}
          {select === 'vendas_vendedor' && (
            <div className="container d-flex justify-content-center ">
              <VendaVendedor />
            </div>
          )}
          {select === 'vendas_instituicao' && (
            <>
              < div className="container d-flex justify-content-center ">
                <VendaInstituicaoQuantidade />
              </div>
              <hr />
              <br />
              <br />
              < div className="container d-flex justify-content-center ">
                <VendaInstituicao />
              </div>

            </>

          )}




        </Box>
      </div >

    </ContainerSecundario >
  )
}

export default Dashboard
