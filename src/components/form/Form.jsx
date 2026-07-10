import React from "react";
import Button from "../button/Button";

function Form({ children, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="row g-3" id='formulario'>
      {children}

    </form>
  );
}
export default Form;
/*<div className="col-12 col-md-3">
  <Button variant="primary">Enviar</Button>
</div>*/