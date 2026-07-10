
function Box({ children, id }) {
  return (
    <div className="col-sm-12 box-base" id={id} >
     
        {children}
    </div>
  );
}

export default Box;