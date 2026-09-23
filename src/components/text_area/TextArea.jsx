
function TextArea({ nameInput, style, maxLength, label, type, value, onChange, onClick, onBlur, readOnly,
    placeholder, id, tooltipText, // <<< novo prop para o tooltip
    tooltipPlacement = "right", // <<< default placement
}) {
    const textElement = (
        <textarea
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
            className={'insert_text'}
        />
    )

    return (
        <div className="form-control" id="input-all">

            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <br></br>
            <br></br>
            {textElement}
        </div>
    );
}

export default TextArea