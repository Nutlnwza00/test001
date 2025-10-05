import { useEffect, useState } from "react";
import axios from "axios";
import MainLayout from "../components/MainLayout";
export default function Booking() {
  const [date, setDate] = useState("");
  const [stopId, setStopId] = useState("");
  const [stops, setStops] = useState([]);

  useEffect(() => {
    axios.get("/api/stops").then((res) => setStops(res.data));
  }, []);

  const handleBooking = async () => {
    try {
      await axios.post(
        "/api/bookings",
        { date, stop_id: stopId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("จองสำเร็จ");
    } catch {
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-lg mx-auto">
        <h1 className="text-xl font-bold mb-4">🚌 จองรถ</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full mb-3 p-2 border rounded bg-white text-black"
        />

        <select
          value={stopId}
          onChange={(e) => setStopId(e.target.value)}
          className="w-full mb-3 p-2 border rounded  bg-white text-black"
        >
          <option value="">เลือกจุดขึ้นรถ</option>
          {stops.map((stop) => (
            <option key={stop.STOP_POINT_ID} value={stop.STOP_POINT_ID}>
              {stop.STOP_NAME}
            </option>
          ))}
        </select>

        <button
          onClick={handleBooking}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          จอง
        </button>
      </div>
    </MainLayout>
  );
}
