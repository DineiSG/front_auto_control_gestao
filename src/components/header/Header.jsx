import React from "react";

function Form({ children, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {children}
      <button type="submit" className="btn btn-primary">
        Enviar
      </button>
    </form>
  );
}
export default Form;