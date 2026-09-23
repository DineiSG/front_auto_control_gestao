import React, { useEffect, useState } from "react";
import ModalBase from "./ModalBase";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
//import { useAuth } from "../../../hooks/useAuth"

const ModalCam = () => {
    const [modalAberto, setModalAberto] = useState(false);
    const [mensagens, setMensagens] = useState([]);

    //const { user } = useAuth()

    /*if (user?.role === "ADMINISTRADOR" || "SUPORTE" || "COLABORADOR"){
        
    }*/
    

    const API_ALERT = import.meta.env.VITE_API_WS

    useEffect(() => {
        
        const socket = new SockJS(`${API_ALERT}`);
        const client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => console.log(str),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log("Conectado ao WebSocket");

            client.subscribe("/topic/mensagens", (mensagem) => {
                const novaMsg = mensagem.body;//Aqui chega a mensagem do backend

                // Adiciona a nova mensagem no estado
                setMensagens((msgs) => [...msgs, novaMsg]);
                setModalAberto(true);

                // Piscar título da aba
                const originalTitle = document.title;
                let interval = setInterval(() => {
                    document.title =
                        document.title === originalTitle ? novaMsg : originalTitle;
                }, 1000);

                // Para quando usuário volta à aba
                const stopTitleBlink = () => {
                    clearInterval(interval);
                    document.title = originalTitle;
                };
                document.addEventListener("visibilitychange", () => {
                    if (!document.hidden) stopTitleBlink();
                });

                // Som de alerta
                const audio = document.getElementById("alertSound");
                if (audio) {
                    audio.currentTime = 0;
                    audio.play().catch((err) => {
                        console.warn("Som bloqueado até interação do usuário.", err);
                    });
                }

                // Notificação
                if (Notification.permission === "granted") {
                    new Notification("Auto Control", {
                        body: novaMsg,
                        icon: "./icons8-erro.gif",
                    });
                }
            });
        };

        client.onStompError = (frame) => {
            console.error("Erro na conexão Stomp:", frame.headers["message"]);
            console.error("Detalhes adicionais:", frame.body);
        };

        client.activate();

        return () => {
            client.deactivate();
        };
    }, []);

    // Sempre que houver mensagens novas, abre o modal
    useEffect(() => {
        if (mensagens.length > 0) {
            setModalAberto(true);
        }
    }, [mensagens]);

    // Função para fechar o modal e limpar as mensagens
    const fecharModal = () => {
        setModalAberto(false);
        setMensagens([]);
    };

    return (
        <div>
            {/* Botão para testar manualmente 
            <button onClick={() => setMensagens(["Mensagem manual para teste"])}>
                Enviar Mensagem
            </button>*/}

            {/* Elemento de áudio precisa existir em algum lugar da página */}
            <audio id="alertSound" src="/alerta.mp3" preload="auto" />

            <ModalBase
                isOpen={modalAberto}
                onClose={() => setModalAberto(fecharModal)}
                messages={mensagens}
                overlay={true}
                playSound={true}
            />
        </div>
    );
};


export default ModalCam
