require("dotenv").config();
const express = require("express");
const oracledb = require("oracledb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

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
async function executeQuery(sql, binds = {}, options = {}) {
  let conn;
  try {
    conn = await oracledb.getConnection();
    const result = await conn.execute(sql, binds, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
      autoCommit: true,
      ...options,
    });
    return result;
  } finally {
    if (conn) await conn.close();
  }
}

// Middleware: Verify Token
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Token required" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
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
app.post("/api/users/login", async (req, res) => {
  const { username, password } = req.body;

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

app.get("/api/employees", authenticateToken, async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT * FROM EMPLOYEE ORDER BY FULL_NAME`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

// ==================== ROLE APIs ====================

app.get("/api/roles", authenticateToken, async (req, res) => {
  try {
    const result = await executeQuery(
      `SELECT * FROM APP_ROLE ORDER BY ROLE_NAME`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/users/:userId/roles", authenticateToken, async (req, res) => {
  const { userId } = req.params;
  const { roleId } = req.body;
  try {
    await executeQuery(
      `INSERT INTO USER_ROLE (USER_ID, ROLE_ID) VALUES (:userId, :roleId)`,
      { userId, roleId }
    );
    res.status(201).json({ message: "Role assigned successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
