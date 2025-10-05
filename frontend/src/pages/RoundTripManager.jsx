import { useEffect, useState } from "react";
import axios from "axios";

export default function RoundTripManager() {
  const [rounds, setRounds] = useState([]);
  const [newRound, setNewRound] = useState({ time: "", route: "" });

  useEffect(() => {
    axios.get("/api/rounds").then((res) => setRounds(res.data));
  }, []);

  const handleAdd = async () => {
    try {
      const res = await axios.post("/api/rounds", newRound);
      setRounds([...rounds, res.data]);
      setNewRound({ time: "", route: "" });
    } catch {
      alert("เพิ่มรอบรถไม่สำเร็จ");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">🕘 จัดการรอบรถ</h1>
      <div className="mb-6 space-y-3">
        <input
          type="time"
          value={newRound.time}
          onChange={(e) => setNewRound({ ...newRound, time: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="เส้นทาง"
          value={newRound.route}
          onChange={(e) => setNewRound({ ...newRound, route: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleAdd}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          เพิ่มรอบรถ
        </button>
      </div>

      <ul className="space-y-2">
        {rounds.map((r, i) => (
          <li key={i} className="p-3 bg-white rounded shadow">
            {r.time} - {r.route}
          </li>
        ))}
      </ul>
    </div>
  );
}
