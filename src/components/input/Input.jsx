import { OverlayTrigger, Tooltip } from "react-bootstrap";

function Input({ nameInput, style, maxLength, label, type, value, onChange, onClick, onBlur, readOnly,
  placeholder, className,
  id, checked, rest,
  nameRadio,
  tooltipText, // <<< novo prop para o tooltip
  tooltipPlacement = "right", // <<< default placement
}) {
  if (type === "radio") {
    // Preparado para checked
    return (
      <div className="form-check">
        <input
          className={`form-check-input ${className || ""}`}
          type="radio"
          id={id}
          name={nameRadio}
          value={value}
          checked={checked}
          onChange={onChange}
          {...rest}
        />
        <label className="form-check-label" htmlFor={id}>
          {label}
        </label>
      </div>
    );
  }

  const inputElement = (
    <input

      aria-required="true"
      type={type}
      value={value}
      name={nameInput}
      onClick={onClick}
      onChange={onChange}
      maxLength={maxLength}
      placeholder={placeholder}
      style={style}
      onBlur={onBlur}
      readOnly={readOnly}
      className={`input input-bordered ${className || ""}`}
    />
  );
  //Controla o tolltip
  return (
    <div className="" id="input-all" >
      <label className="label">
        <span className="label-text">{label}</span>
      </label>

      {tooltipText ? (
        <OverlayTrigger
          placement={tooltipPlacement}
          overlay={<Tooltip id={`tooltip-${id}`}>{tooltipText}</Tooltip>}
        >
          {inputElement}
        </OverlayTrigger>
      ) : (
        inputElement
      )}
    </div>
  );
}
export default Input;
