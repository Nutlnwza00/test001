export default function Unauthorized() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-100 via-rose-200 to-pink-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 text-center p-6">
      <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">🚫 ไม่มีสิทธิ์เข้าถึง</h1>
      <p className="text-gray-700 dark:text-gray-300 mb-6">คุณไม่มีสิทธิ์เข้าถึงหน้านี้ หากคิดว่าเป็นความผิดพลาด กรุณาติดต่อผู้ดูแลระบบ</p>
      <a
        href="/dashboard"
        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow transition"
      >
        กลับไปหน้าหลัก
      </a>
    </div>
  );
}