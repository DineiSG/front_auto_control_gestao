
function Table({ data = [], columns = [], className }) {
  return (
    <table className={className}>
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key} className="px-4 py-2" id="head-table">
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {columns.map((col) => {
              const value = row[col.key];
              const formattedValue = col.format ? col.format(value) : value;
              return (
                <td key={col.key} >
                  {formattedValue}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export default Table;