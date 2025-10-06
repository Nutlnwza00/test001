const jwt = require("jsonwebtoken");

// ✅ ตรวจสอบว่า token ถูกต้อง
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    console.log("🔐 Token payload:", user); // ✅ log ตรงนี้
    req.user = user;
    next();
  });
}

// ✅ ตรวจสอบ role
function requireRole(role) {
  return (req, res, next) => {
    const userRole = req.user?.role?.toLowerCase(); // ✅ normalize case
    if (req.user?.role?.toLowerCase() !== role.toLowerCase()) {
        console.log("⛔️ Access denied. Role:", req.user?.role);
        return res.status(403).json({ error: "ไม่มีสิทธิ์เข้าถึง" });
    }
    next();
  };
}

module.exports = { authenticateToken, requireRole };
