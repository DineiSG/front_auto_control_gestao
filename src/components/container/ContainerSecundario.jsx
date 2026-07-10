import "../container/Container.css"

import React, { useEffect, useRef } from 'react'
import Velocity from 'velocity-animate';


function ContainerSecundario({ children }) {

    // Referência para o elemento que será animado
    const contentRef = useRef(null);
    // Flag para garantir que o efeito só seja executado uma vez
    const effectRun = useRef(false); // flag

    //
    useEffect(() => {
        if (!effectRun.current) {
            effectRun.current = true; // marca como já executado
            Velocity(contentRef.current,
                { translateY: [0, 50], opacity: [1, 0] },
                { duration: 3000, delay: 0, easing: "easeOutExpo" }
            );
        }
    }, []);

    return (
        <div className="container-fluid container_secundario min-vh-100 d-flex flex-column p-0 container-secundario" ref={contentRef}>
            {children}
        </div>
    )
}

export default ContainerSecundario