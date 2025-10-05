
export default function AdminLayout({ children }) {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <Sidebar role="admin" />
      <main className="p-6 w-full">{children}</main>
    </div>
  );
}
