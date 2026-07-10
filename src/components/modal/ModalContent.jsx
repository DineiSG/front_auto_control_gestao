import { useEffect } from "react";
import './Modal.css'
import { createPortal } from "react-dom";

const ModalContent = ({
    isOpen,
    onClose,
    children,
    size = "fullscreen" // normal | large | fullscreen
}) => {

    // Bloqueia scroll do body quando aberto
    useEffect(() => {
        document.body.style.overflow = isOpen ? "hidden" : "auto";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return createPortal(
        <div className="modal_overlay_content" onClick={onClose}>

            <div className={`modal_box_content ${size}`} onClick={(e) => e.stopPropagation()}>

                {/*<div className="modal_header_content">
                    <h2>{title}</h2>
                </div>*/}

                <div className="modal_body_content">
                    
                    {children}
                    
                </div>

                {/*<div className="modal_footer_content">
                    <Button onClick={onClose}>FECHAR</Button>
                </div>*/}

            </div>
        </div>,
        document.body
    );
    
};

export default ModalContent;