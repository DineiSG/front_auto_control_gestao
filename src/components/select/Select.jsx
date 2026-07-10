
function Select({ options = [], value, onChange, className, style, name, label, multiple = false }) {
    return (
        <div id="select-all">
            <label className="label">
                <span className="label-text">{label}</span>
            </label>
            <select name={name} className={className} value={value} onChange={(e) => {
                console.log('Select onChange value:', e.target.value)
                onChange && onChange(e)
            }} style={style} multiple={multiple}  >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>

    )
}
export default Select