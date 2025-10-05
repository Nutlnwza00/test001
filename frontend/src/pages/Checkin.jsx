import { useState } from "react";
import axios from "axios";

export default function Checkin() {
  const [bookingId, setBookingId] = useState("");

  const handleCheckin = async () => {
    try {
      await axios.post("/api/checkin", { bookingId });
      alert("เช็คอินสำเร็จ");
    } catch {
      alert("เช็คอินไม่สำเร็จ");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">✅ เช็คอิน</h1>
      <input
        type="text"
        placeholder="Booking ID"
        value={bookingId}
        onChange={(e) => setBookingId(e.target.value)}
        className="w-full mb-3 p-2 border rounded"
      />
      <button
        onClick={handleCheckin}
        className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
      >
        เช็คอิน
      </button>
    </div>
  );
}
