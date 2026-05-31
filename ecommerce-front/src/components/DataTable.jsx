/**
 * columns: { key, header, render?(row) => ReactNode, width? }[]
 * data: object[]
 * keyExtractor?: (row) => string|number  — defaults to row.id
 * empty?: string
 */
export default function DataTable({ columns = [], data, keyExtractor, empty = 'Sin datos' }) {
  const getKey = keyExtractor ?? ((row) => row.id)

  if (!data || data.length === 0) {
    return <div className="empty-state">{empty}</div>
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={col.width ? { width: col.width } : undefined}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={getKey(row)}>
              {columns.map((col) => (
                <td key={col.key}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
