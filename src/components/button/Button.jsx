import React from 'react';

function Button({onClick, children, variant = 'primary', disabled}) {
  const className = `button ${ variant }`

  return(
  <button className={className} onClick={onClick} disabled={disabled}>
    {children}
  </button>
  )
}

export default Button;
