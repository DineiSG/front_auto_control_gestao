import { useState } from 'react'
import Button from '../../components/button/Button'
import Input from '../../components/input/Input'
import { useControlAuth } from '../../services/useControlAuth'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate, Link } from "react-router-dom";

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
        <div className='col-12 d-flex flex-column align-items-center min-vh-100'>
            <div className="d-flex align-items-center">
                <img className='col-12' id='logo' src='./LogoAutoControl.png' alt="Auto Control" width={470} height={300} />
            </div>
            <form className='d-flex flex-column align-items-center justify-content-center was-validated'>
                <Input id="validationTooltipUsername input_login"  type="text"  nameInput="usuario" name="login" placeholder="Login" 
                    value={username} onChange={(e) => setUsername(e.target.value)} required />
                <br />
                <Input className={login} type={showSenha ? "text" : "password"} nameInput="senha" name="senha" placeholder="Senha"
                    value={password} onChange={(e) => setPassword(e.target.value)} required/>
                <br />
                <button type="button" onClick={() => setShowSenha(!showSenha)} style={{ background: "none", border: "none", cursor: "pointer"}}
                    title="Visualizar senha" >
                    {showSenha ? (<img width="30" height="30" src="https://img.icons8.com/carbon-copy/30/hide.png" alt="hide" />
                    ) : (
                        <img width="30" height="30" src="https://img.icons8.com/external-icongeek26-outline-icongeek26/64/external-Eye-content-edition-icongeek26-outline-icongeek26.png" alt="show" />
                    )}
                </button>
                <br />

            </form>
            <div className="d-flex align-items-center mb-3" id='button_login' >
                <Button variant='primary' as={Link} to="/home" type="submit" onClick={handleSubmit}>ACESSAR</Button >
            </div>
        </div>
    )
}


export default Login
