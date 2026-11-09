import Modal from 'react-bootstrap/Modal';
import Button from '../../components/button/Button';

function ModalGenerico({ modal, fecharModal }) {

    const executarAcao = () => {
        if (modal.acao) {
            modal.acao();
        }
    };

    return (
        <Modal
            show={modal.aberto}
            onHide={fecharModal}
            centered
            id="modal-bootstrap"
        >
            <Modal.Header closeButton style={{ backgroundColor: modal.cor || "#56046b" }}>
                <Modal.Title style={{ color: "#fff" }}>
                    {modal.titulo || "Atenção"}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {modal.mensagem}
            </Modal.Body>

            <Modal.Footer>

                {modal.tipo === "confirmacao" ? (
                    <>
                        <Button
                            variant="danger"
                            onClick={fecharModal}
                        >
                            NÃO
                        </Button>

                        <Button
                            variant="primary"
                            onClick={executarAcao}
                        >
                            SIM
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="primary"
                        onClick={() => {
                            fecharModal();

                            if (modal.aoFechar) {
                                modal.aoFechar();
                            }
                        }}
                    >
                        OK
                    </Button>
                )}

            </Modal.Footer>
        </Modal>
    );
}

export default ModalGenerico;