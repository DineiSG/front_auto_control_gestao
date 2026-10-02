function Form({ children, onSubmit }) {
  return (
    <form onSubmit={onSubmit} className="row g-3 col-12" id='formulario'>
      {children}

    </form>
  );
}
export default Form;
/*<div className="col-12 col-md-3">
  <Button variant="primary">Enviar</Button>
</div>*/