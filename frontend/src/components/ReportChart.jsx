// Generic ReportChart component
// Props:
// - title: string
// - type: 'bar' | 'clustered' | 'pie' | 'line' | 'table'
// - data: array of objects
// This is a placeholder; you can integrate a real chart lib (e.g., Chart.js, Recharts) later.
export default function ReportChart({ title, type, data }) {
  return (
    <div className="mb-10">
      <h2 className="text-xl font-semibold mb-4 text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
        {title}
      </h2>
      <div className="p-4 rounded-lg border border-indigo-200 dark:border-indigo-700 bg-white/70 dark:bg-gray-800/60 backdrop-blur">
        {renderContent(type, data)}
      </div>
    </div>
  );
}

function renderContent(type, data) {
  if (!data || data.length === 0) {
    return <div className="text-sm italic text-gray-500">ไม่มีข้อมูล</div>;
  }
  switch (type) {
    case "table":
      return <SimpleTable data={data} />;
    case "pie":
    case "bar":
    case "clustered":
    case "line":
      return (
        <pre className="text-xs overflow-auto max-h-72 bg-gray-900 text-green-300 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>
      );
    default:
      return <div>Unsupported chart type: {type}</div>;
  }
}

function SimpleTable({ data }) {
  const cols = Object.keys(data[0] || {});
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-indigo-600 text-white">
            {cols.map((c) => (
              <th key={c} className="px-3 py-2 text-left font-medium">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              className={i % 2 === 0 ? "bg-indigo-50 dark:bg-gray-700/40" : "bg-white dark:bg-gray-800"}
            >
              {cols.map((c) => (
                <td key={c} className="px-3 py-2 border-b border-indigo-100 dark:border-gray-700">
                  {row[c] != null ? String(row[c]) : "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


