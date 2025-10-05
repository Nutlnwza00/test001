export default function ReportFilter({
  year,
  setYear,
  start,
  setStart,
  end,
  setEnd,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div>
        <label className="label">ปี</label>
        <input
          type="text"
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="label">วันที่เริ่ม</label>
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="input"
        />
      </div>
      <div>
        <label className="label">วันที่สิ้นสุด</label>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="input"
        />
      </div>
    </div>
  );
}
