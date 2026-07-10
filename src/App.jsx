import './App.css'

import ContainerPrincipal from "./components/container/ContainerPrincipal";
import Body from './pages/body/Body';
import './chartStyle.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';


function App() {

  return (
    
    <>
      <AuthProvider>
        <BrowserRouter>
          <ContainerPrincipal>
            <Body />
          </ContainerPrincipal>
        </BrowserRouter>
      </AuthProvider>
    </>
  )
}

export default App
