import { useState } from 'react'
import ContainerPrincipal from '../../components/container/ContainerPrincipal'
import { Link } from 'react-router-dom'
import { Button } from 'react-bootstrap'
import Input from '../../components/input/Input'
import { useControlAuth } from '../../services/useControlAuth'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from "react-router-dom";

const Login = () => {
    const [showSenha, setShowSenha] = useState(false)
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const { authenticateUser } = useControlAuth("/login")

    const navigate = useNavigate();
    const { login } = useAuth();

    async function handleSubmit(e) {
        e.preventDefault();

        const credentials = ({ username, password });

        try {
            const result = await authenticateUser(credentials);

            if (result) {
                login(result.token);
                navigate("/home");
            } else {
                alert("Falha no login. Verifique suas credenciais.");
            }



        } catch (error) {
            alert("Erro ao tentar logar.");
            console.error(error);
        }
    }

    return (
        <div>
            <ContainerPrincipal >
                <div className='col-md3 d-flex flex-column align-items-center align-self-center justify-content-center'
                    style={{ backgroundColor: "#5c8efa", marginTop: "40px", borderRadius: "10px", padding: "50px" }}>
                    <div className="d-flex align-items-center mb-1">
                        <img src='./LogoAutoControl.png' alt="Auto Control" width={470} height={300} />
                    </div>
                    <form className='d-flex flex-column align-items-center justify-content-center' id='input_login' onSubmit={handleSubmit}>
                        <Input id="input_login" label="Login:" type="text" style={{ width: '200px' }} nameInput="usuario" name="login" placeholder="Login"
                            value={username} onChange={(e) => setUsername(e.target.value)} />
                        <br />
                        <Input className={login} label="Senha:" type={showSenha ? "text" : "password"} style={{ width: "200px" }} nameInput="senha" name="senha" placeholder="Senha"
                            value={password} onChange={(e) => setPassword(e.target.value)} />
                        <br />
                        <button type="button" onClick={() => setShowSenha(!showSenha)} style={{ background: "none", border: "none", cursor: "pointer" }}
                            title="Visualizar senha" >
                            {showSenha ? (<img width="30" height="30" src="https://img.icons8.com/carbon-copy/30/hide.png" alt="hide" />
                            ) : (
                                <img width="30" height="30" src="https://img.icons8.com/external-icongeek26-outline-icongeek26/64/external-Eye-content-edition-icongeek26-outline-icongeek26.png" alt="show" />
                            )}
                        </button>
                        <br />
                        <div className="d-flex align-items-center mb-3" id="button_login" >
                            <Button className='button.primary' as={Link} to="/home" type="submit" onClick={handleSubmit}>ACESSAR</Button >
                        </div>
                    </form>
                </div>
            </ContainerPrincipal>
        </div >
    )
}


export default Login
