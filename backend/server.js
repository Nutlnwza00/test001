require("dotenv").config();
const express = require("express");
const oracledb = require("oracledb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const employeeRoutes = require("./routes/employeeRoutes");

// ✅ Mount route

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use("/api", employeeRoutes);

// Oracle Instant Client
const clientLibDir =
  process.platform === "win32"
    ? "C:\\oracle\\instantclient_23_9"
    : "/opt/oracle/instantclient_11_2";
oracledb.initOracleClient({ libDir: clientLibDir });

// Oracle Connection Pool
const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectString: process.env.DB_CONNECTION_STRING,
  poolMin: 2,
  poolMax: 10,
  poolIncrement: 2,
};

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET;

// Create Pool
async function initialize() {
  try {
    await oracledb.createPool(dbConfig);
    console.log("✅ Oracle pool created");
  } catch (err) {
    console.error("❌ Pool error:", err);
    process.exit(1);
  }
}

// Close Pool on Exit
process.on("SIGINT", async () => {
  try {
    await oracledb.getPool().close(10);
    console.log("🛑 Pool closed");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

// Helper: Execute Query

async function executeQuery(sql, params = {}) {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
    });

    const result = await connection.execute(sql, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return result.rows;
  } catch (err) {
    console.error("❌ DB error:", err.message);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (closeErr) {
        console.error("❌ Error closing connection:", closeErr.message);
      }
    }
  }
}

// Middleware: Verify Token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.warn("⛔ No token provided");
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.warn("⛔ Invalid token:", err.message);
      return res.sendStatus(403);
    }

    req.user = user;
    if (user.role === "admin") {
      console.log("🔐 Admin authenticated:", user.username);
    }
    next();
  });
}

// Middleware: Check Permission
function checkPermission(required) {
  return (req, res, next) => {
    if (!req.user?.permissions?.includes(required)) {
      return res.status(403).json({ error: "Permission denied" });
    }
    next();
  };
}

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
};

app.use(cors(corsOptions));

// ==================== AUTH ====================
app.get(
  "/api/users",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await executeQuery(`
      SELECT
        u.USER_ID AS ID,
        u.USERNAME,
        r.ROLE_NAME AS ROLE
      FROM APP_USER u
      JOIN USER_ROLE ur ON u.USER_ID = ur.USER_ID
      JOIN APP_ROLE r ON ur.ROLE_ID = r.ROLE_ID
    `);

      const rows = Array.isArray(result?.rows) ? result.rows : result; // รองรับทั้งสองแบบ

      const users = rows.map((u) => ({
        id: u.ID,
        username: u.USERNAME,
        role: u.ROLE,
      }));

      res.json(users);
    } catch (err) {
      console.error("❌ Error in /api/users:", err.message);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดผู้ใช้" });
    }
  }
);
app.get(
  "/api/roles",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    console.log("📥 Role access by:", req.user?.username); // ✅ log ตรงนี้

    try {
      const result = await executeQuery(
        `SELECT ROLE_ID, ROLE_NAME, DESCRIPTION FROM APP_ROLE`
      );
      const roles = Array.isArray(result?.rows) ? result.rows : result;

      console.log("📦 Roles from DB:", roles); // ✅ log ตรงนี้
      res.json(roles);
    } catch (err) {
      console.error("❌ Error in /api/roles:", err.message);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดสิทธิ์" });
    }
  }
);
app.put(
  "/api/users/:id/role",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    console.log("📥 Role change request:", { userId, role }); // ✅ log ตรงนี้

    try {
      const roleRes = await executeQuery(
        `SELECT ROLE_ID FROM APP_ROLE WHERE ROLE_NAME = :roleName`,
        { roleName: role }
      );

      const rows = Array.isArray(roleRes?.rows) ? roleRes.rows : roleRes;
      console.log("🔍 Role lookup result:", rows); // ✅ log ตรงนี้

      if (!rows.length) {
        console.warn("⛔ Role not found:", role);
        return res.status(404).json({ error: "Role not found" });
      }

      const roleId = rows[0].ROLE_ID;

      await executeQuery(
        `UPDATE USER_ROLE SET ROLE_ID = :roleId WHERE USER_ID = :userId`,
        { roleId, userId }
      );

      console.log("✅ Role updated for USER_ID:", userId); // ✅ log ตรงนี้
      res.json({ success: true });
    } catch (err) {
      console.error("❌ Error updating role:", err.message);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการเปลี่ยนสิทธิ์" });
    }
  }
);

app.post("/api/users/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};

    const userRes = await executeQuery(
      `SELECT USER_ID, USERNAME, FULL_NAME, PHONE_NUMBER, PASSWORD_HASH FROM APP_USER WHERE USERNAME = :username`,
      { username }
    );
    const user = userRes.rows[0];
    if (!user) return res.status(404).json({ error: "ไม่พบผู้ใช้" });

    const valid = await bcrypt.compare(password, user.PASSWORD_HASH);
    if (!valid) return res.status(401).json({ error: "รหัสผ่านไม่ถูกต้อง" });

    const roleRes = await executeQuery(
      `SELECT r.ROLE_NAME FROM USER_ROLE ur JOIN APP_ROLE r ON ur.ROLE_ID = r.ROLE_ID WHERE ur.USER_ID = :userId`,
      { userId: user.USER_ID }
    );
    const permRes = await executeQuery(
      `SELECT p.PERMISSION_NAME FROM PERMISSION p
     JOIN ROLE_PERMISSION rp ON p.PERMISSION_ID = rp.PERMISSION_ID
     JOIN USER_ROLE ur ON rp.ROLE_ID = ur.ROLE_ID
     WHERE ur.USER_ID = :userId`,
      { userId: user.USER_ID }
    );

    const role = roleRes.rows[0]?.ROLE_NAME || "user";
    const permissions = permRes.rows.map((p) => p.PERMISSION_NAME);

    const token = jwt.sign(
      {
        userId: user.USER_ID,
        username: user.USERNAME,
        role,
        permissions,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      token,
      user: {
        userId: user.USER_ID,
        username: user.USERNAME,
        fullName: user.FULL_NAME,
        phoneNumber: user.PHONE_NUMBER,
        role,
        permissions,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err.message);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ" });
  } 
});

app.get("/api/users/profile", authenticateToken, async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT USER_ID, USERNAME, FULL_NAME, EMAIL, PHONE_NUMBER FROM APP_USER WHERE USER_ID = :userId`,
      { userId: req.user.userId }
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ADMIN DASHBOARD ====================

app.get(
  "/api/admin/dashboard",
  authenticateToken,
  checkPermission("VIEW_ADMIN_DASHBOARD"),
  async (req, res) => {
    res.json({ message: "ข้อมูลสำหรับ admin dashboard" });
  }
);

// ==================== BOOKING ====================

app.post("/api/bookings", authenticateToken, async (req, res) => {
  const {
    user_id,
    round_trip_id,
    pickup_stop_id,
    dropoff_stop_id,
    seat_count,
  } = req.body;
  try {
    const result = await executeQuery(
      `INSERT INTO BOOKING (USER_ID, ROUND_TRIP_ID, PICKUP_STOP_ID, DROPOFF_STOP_ID, SEAT_COUNT, STATUS, BOOKING_TIME)
       VALUES (:user_id, :round_trip_id, :pickup_stop_id, :dropoff_stop_id, :seat_count, 'pending', SYSTIMESTAMP)
       RETURNING BOOKING_ID INTO :booking_id`,
      {
        user_id,
        round_trip_id,
        pickup_stop_id,
        dropoff_stop_id,
        seat_count,
        booking_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    res.status(201).json({ bookingId: result.outBinds.booking_id[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CHECK-IN ====================

app.post("/api/checkins", authenticateToken, async (req, res) => {
  const { booking_id, scanner_employee_id } = req.body;
  try {
    const result = await executeQuery(
      `INSERT INTO CHECKIN (BOOKING_ID, SCANNER_EMPLOYEE_ID, CHECKIN_TIME, SCAN_RESULT)
       VALUES (:booking_id, :scanner_employee_id, SYSTIMESTAMP, 'success')
       RETURNING CHECKIN_ID INTO :checkin_id`,
      {
        booking_id,
        scanner_employee_id,
        checkin_id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
      }
    );
    res.status(201).json({ checkinId: result.outBinds.checkin_id[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== EMPLOYEE ====================

// ==================== VEHICLE ====================

app.get("/api/vehicles", async (req, res) => {
  try {
    const result = await executeQuery(`SELECT * FROM VEHICLE ORDER BY STATUS`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== ROUTE ====================

app.get("/api/routes", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT * FROM ROUTE ORDER BY ROUTE_NAME`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== SCHEDULE ====================

app.get("/api/schedules", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT * FROM ROUND_TRIP ORDER BY TRIP_DATE`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== STOP ====================
// ==================== STOP APIs ====================

app.get("/api/stops", async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT * FROM STOP_POINT ORDER BY STOP_POINT_ID`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== PERMISSION APIs ====================

app.get(
  "/api/roles/:roleId/permissions",
  authenticateToken,
  async (req, res) => {
    const { roleId } = req.params;
    try {
      const result = await executeQuery(
        `SELECT p.PERMISSION_NAME
       FROM PERMISSION p
       JOIN ROLE_PERMISSION rp ON p.PERMISSION_ID = rp.PERMISSION_ID
       WHERE rp.ROLE_ID = :roleId`,
        { roleId }
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);



// ==================== SYSTEM HEALTH ====================

app.get("/api/health", async (req, res) => {
  try {
    const result = await executeQuery(`SELECT 'OK' AS status FROM dual`);
    res.json({ status: result.rows[0].STATUS });
  } catch (err) {
    res.status(500).json({ error: "Database connection failed" });
  }
});

// 1. Monthly Stop Traffic
app.get("/api/reports/monthly-stop-traffic", async (req, res) => {
  const { year } = req.query;
  try {
    const result = await db.execute(
      `SELECT TO_CHAR(TRIP_DATE, 'MM') AS MONTH, STOP_POINT_ID, COUNT(*) AS TOTAL
       FROM BOOKING
       WHERE EXTRACT(YEAR FROM TRIP_DATE) = :year
       GROUP BY TO_CHAR(TRIP_DATE, 'MM'), STOP_POINT_ID
       ORDER BY MONTH`,
      [year]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดใน monthly-stop-traffic" });
  }
});

// 2. Monthly Booking Summary
app.get("/api/reports/monthly-booking-summary", async (req, res) => {
  const { year } = req.query;
  try {
    const result = await db.execute(
      `SELECT TO_CHAR(TRIP_DATE, 'MM') AS MONTH, COUNT(*) AS TOTAL
       FROM BOOKING
       WHERE EXTRACT(YEAR FROM TRIP_DATE) = :year
       GROUP BY TO_CHAR(TRIP_DATE, 'MM')
       ORDER BY MONTH`,
      [year]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดใน monthly-booking-summary" });
  }
});

// 3. User Behavior
app.get("/api/reports/user-behavior", async (req, res) => {
  const { start, end } = req.query;
  try {
    const result = await db.execute(
      `SELECT USER_ID, COUNT(*) AS BOOKINGS
       FROM BOOKING
       WHERE TRIP_DATE BETWEEN TO_DATE(:start, 'YYYY-MM-DD') AND TO_DATE(:end, 'YYYY-MM-DD')
       GROUP BY USER_ID`,
      [start, end]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดใน user-behavior" });
  }
});

// 4. Daily Route Usage
app.get("/api/reports/daily-route-usage", async (req, res) => {
  const { start, end } = req.query;
  try {
    const result = await db.execute(
      `SELECT TRIP_DATE, ROUTE_ID, COUNT(*) AS TOTAL
       FROM BOOKING
       WHERE TRIP_DATE BETWEEN TO_DATE(:start, 'YYYY-MM-DD') AND TO_DATE(:end, 'YYYY-MM-DD')
       GROUP BY TRIP_DATE, ROUTE_ID
       ORDER BY TRIP_DATE`,
      [start, end]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดใน daily-route-usage" });
  }
});

// 5. Stop Traffic by Round
app.get("/api/reports/stop-traffic-by-round", async (req, res) => {
  const { start, end } = req.query;
  try {
    const result = await db.execute(
      `SELECT ROUND_ID, STOP_POINT_ID, COUNT(*) AS TOTAL
       FROM BOOKING
       WHERE TRIP_DATE BETWEEN TO_DATE(:start, 'YYYY-MM-DD') AND TO_DATE(:end, 'YYYY-MM-DD')
       GROUP BY ROUND_ID, STOP_POINT_ID`,
      [start, end]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "เกิดข้อผิดพลาดใน stop-traffic-by-round" });
  }
});

const PORT = process.env.PORT || 5000;

initialize()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚐 Shuttle Bus Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  });
