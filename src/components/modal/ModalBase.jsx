import { useEffect, useRef } from "react";
import './Modal.css'    // Arquivo de estilos
import Button from "../../components/button/Button";

/**
 * Componente de Modal genérico e reutilizável.
 *
 * Props:
 * - isOpen (boolean): controla se o modal deve aparecer ou não.
 * - onClose (function): função chamada quando o usuário clica em "Fechar".
 * - title (string): título exibido no cabeçalho do modal.
 * - messages (array): lista de mensagens para exibir dentro do modal.
 * - overlay (boolean): define se o modal vai sobrepor toda a tela (true) ou aparecer inline (false).
 * - playSound (boolean): define se o som deve tocar sempre que o modal for aberto.
 */
const ModalBase = ({ isOpen, onClose, title, messages = [], overlay = true, playSound = false }) => {
    // Ref para acessar o elemento <audio>
    const audioRef = useRef(null);

    // Efeito que dispara quando o modal abre
    useEffect(() => {
        if (isOpen && playSound && audioRef.current) {
            // Toca o som apenas se o modal foi aberto e a opção playSound estiver ativa
            audioRef.current.play().catch(() => {
                console.log("Som não pôde ser reproduzido automaticamente.");
            });
        }
    }, [isOpen, playSound]);

    // Se o modal não estiver aberto, não renderiza nada
    if (!isOpen) return null;


    // Conteúdo principal do modal
    const modalContent = (
        <div className="modal_conteudo">
            {/* Cabeçalho com ícone e título */}
            <div className="icone_alerta">
                <img width="50" height="50" src="./icons8-erro.gif" alt="warning-shield" /> {title && <h2>{title}</h2>}
            </div>

            {/* Corpo do modal (lista de mensagens ou texto vazio) */}
            <div className="modal_corpo">
                {messages.length > 0 ? (
                    <ul className="lista_mensagens">
                        {messages.map((msg, index) => (
                            <li key={index} className="item_mensagem">
                                {msg}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="sem_mensagens">Nenhuma mensagem recebida ainda.</p>
                )}
            </div>

            {/* Rodapé com botão de fechar */}
            <div className="modal_rodape">
                <Button onClick={onClose}>FECHAR</Button>
            </div>

            {/* Elemento de áudio que será reproduzido quando o modal abrir */}
            <audio ref={audioRef} src="/alerta.mp3" preload="auto" />
        </div>
    );

    // Se overlay=true, renderiza com fundo escurecido sobre toda a tela
    if (overlay) {
        return <div className="modal_overlay">{modalContent}</div>;
    }

    // Se overlay=false, renderiza apenas a caixa inline (sem sobreposição)
    return modalContent;
};

export default ModalBase;