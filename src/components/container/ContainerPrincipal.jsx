  import "../container/Container.css"


  function ContainerPrincipal({ children }) {




    return (

      <div className="container-fluid container_principal min-vh-100 flex-column p-0" >
        {children}
      </div>

    );
  }

  export default ContainerPrincipal;
