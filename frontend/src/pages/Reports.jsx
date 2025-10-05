import { useState, useEffect } from "react";
import api from "../services/api";
import ReportChart from "../components/ReportChart";
import ReportFilter from "../components/ReportFilter";

export default function Reports() {
  const [year, setYear] = useState("2568");
  const [start, setStart] = useState("2025-09-01");
  const [end, setEnd] = useState("2025-09-07");

  const [monthlyTraffic, setMonthlyTraffic] = useState([]);
  const [bookingSummary, setBookingSummary] = useState([]);
  const [userBehavior, setUserBehavior] = useState([]);
  const [routeUsage, setRouteUsage] = useState([]);
  const [stopTraffic, setStopTraffic] = useState([]);

  useEffect(() => {
    api
      .get(`/api/reports/monthly-stop-traffic?year=${year}`)
      .then((res) => setMonthlyTraffic(res.data));
    api
      .get(`/api/reports/monthly-booking-summary?year=${year}`)
      .then((res) => setBookingSummary(res.data));
    api
      .get(`/api/reports/user-behavior?start=${start}&end=${end}`)
      .then((res) => setUserBehavior(res.data));
    api
      .get(`/api/reports/daily-route-usage?start=${start}&end=${end}`)
      .then((res) => setRouteUsage(res.data));
    api
      .get(`/api/reports/stop-traffic-by-round?start=${start}&end=${end}`)
      .then((res) => setStopTraffic(res.data));
  }, [year, start, end]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-200 to-pink-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 p-6">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 animate-fade-in-up">
        <h1 className="text-3xl font-bold text-indigo-700 dark:text-white mb-6">
          📊 รายงานระบบ Shuttle Bus
        </h1>

        <ReportFilter
          year={year}
          setYear={setYear}
          start={start}
          setStart={setStart}
          end={end}
          setEnd={setEnd}
        />

        <ReportChart
          title="จำนวนขึ้น/ลงรายเดือน"
          type="bar"
          data={monthlyTraffic}
        />
        <ReportChart
          title="สถิติการจองรายเดือน"
          type="clustered"
          data={bookingSummary}
        />
        <ReportChart
          title="พฤติกรรมผู้ใช้ (ช่วงวันที่)"
          type="pie"
          data={userBehavior}
        />
        <ReportChart
          title="จำนวนผู้ใช้แต่ละเส้นทางรายวัน"
          type="line"
          data={routeUsage}
        />
        <ReportChart
          title="จำนวนขึ้น/ลงในแต่ละจุดจอดตามรอบเวลา"
          type="table"
          data={stopTraffic}
        />
      </div>
    </div>
  );
}
