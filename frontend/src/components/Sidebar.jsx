// export default function Sidebar({ role }) {
//   const menuItems = [
//     { label: "หน้าหลัก", icon: "🏠", path: "/dashboard" },
//     { label: "จองรถ", icon: "🚌", path: "/booking" },
//     { label: "ข้อมูลผู้ใช้", icon: "👤", path: "/profile" },
//     { label: "ตารางการเดินรถ", icon: "📅", path: "/schedule" },
//     ...(role === "admin"
//       ? [{ label: "Admin", icon: "🛠️", path: "/admin-dashboard" }]
//       : []),
//     { label: "ออกจากระบบ", icon: "🚪", path: "/logout" },
//   ];

//   return (
//     <aside className="w-64 bg-white/10 backdrop-blur-md text-white min-h-screen p-6 space-y-6 shadow-md border-r border-white/20">
//       <h2 className="text-2xl font-bold tracking-wide">🚐 Shuttle Bus</h2>
//       <nav className="space-y-4">
//         {menuItems.map((item, index) => (
//           <a
//             key={index}
//             href={item.path}
//             className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/20 transition"
//           >
//             <span className="text-xl">{item.icon}</span>
//             <span className="text-sm font-medium">{item.label}</span>
//           </a>
//         ))}
//       </nav>
//     </aside>
//   );
// }
