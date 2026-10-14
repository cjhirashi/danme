interface AdminTableProps {
  headers: string[];
  rows: (string | React.ReactNode)[][];
  actions?: React.ReactNode[];
}

export default function AdminTable({ headers, rows, actions }: AdminTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-verde-danme/20 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-verde-danme/20 bg-verde-oscuro">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-semibold text-white">
                {header}
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="px-4 py-3 font-semibold text-white">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-verde-danme/10 transition-all duration-200 hover:bg-verde-danme/5"
            >
              {row.map((cell, cellIdx) => (
                <td key={cellIdx} className="px-4 py-3 text-verde-oscuro">
                  {cell}
                </td>
              ))}
              {actions && actions.length > 0 && (
                <td className="flex gap-2 px-4 py-3">{actions[idx]}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
