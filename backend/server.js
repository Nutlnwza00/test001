const express = require('express');
const oracledb = require('oracledb');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// *** WARNING: No JWT or bcrypt for security ***

const clientLibDir =
  process.platform === "win32"
    ? "C:\\oracle\\instantclient_23_9" // <-- แก้ไขพาธนี้
    : "/opt/oracle/instantclient_11_2"; // <-- แก้ไขสำหรับ Linux

oracledb.initOracleClient({ libDir: clientLibDir });


const dbConfig = { 
  user: "DBT68086", // User ของคุณ
  password: "28797", // Password ของคุณ
  connectString: "203.188.54.7:1521/database3", // Host:Port/SID
};

async function initOracle() { 
  try {
    await oracledb.createPool(dbConfig); 
  console.log("✅ Oracle DB connected");
  } catch (err) {
    console.error("❌ Oracle DB connection error:", err); 
    process.exit(1); 
  }
}

// -------------------------------------------------------------
// *************** ฟังก์ชันตรวจสอบผู้ใช้ด้วย Plain Text Password ************
// -------------------------------------------------------------
async function checkLogin(connection, username, password) {
  // ลำดับการตรวจสอบ: Superadmin -> Admin -> User
  const roles = [
    { name: "superadmin", table: "SUPERADMIN" },
    { name: "admin", table: "ADMIN" },
    { name: "users", table: "USERS" },
  ];

  for (const roleInfo of roles) {
    try {
      // ดึงข้อมูลผู้ใช้ตาม Username
      const result = await connection.execute(
        `SELECT * FROM ${roleInfo.table} WHERE USERNAME = :un`,
        { un: username },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];

        // ✅ รองรับทั้ง PASSWORD_HASH และ PASSWORD
        const storedHash = user.PASSWORD_HASH || user.PASSWORD;

        // ✅ ตรวจสอบว่ามี Hash หรือไม่
        if (!storedHash) {
          console.error(`❌ ไม่พบรหัสผ่านในตาราง ${roleInfo.table}`);
          return { success: false, message: "ข้อมูลรหัสผ่านไม่ถูกต้อง" };
        }

        console.log(`🔍 Checking ${roleInfo.name}:`, username);
        console.log(`🔑 Stored Hash:`, storedHash);

        // ตรวจสอบรหัสผ่านด้วย bcrypt
        const passwordMatch = await bcrypt.compare(password, storedHash);

        if (passwordMatch) {
          // ล็อกอินสำเร็จ
          return { success: true, user, role: roleInfo.name };
        }
        return { success: false, message: "รหัสผ่านไม่ถูกต้อง" };
      }
    } catch (err) {
      console.error(`Error checking ${roleInfo.name}:`, err);
    }
  }
  return { success: false, message: "ไม่พบชื่อผู้ใช้" };
}

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  let connection;

  try {
    connection = await oracledb.getConnection(dbConfig);
    const authResult = await checkLogin(connection, username, password);

    if (authResult.success) {
      const { role } = authResult;

      // แสดงผลใน Backend Console เมื่อล็อกอินสำเร็จ
      console.log(`[LOGIN SUCCESS] User: ${username} (Role: ${role})`);

      // ส่งแค่ Role กลับไปให้ Frontend (ไม่มี Token)
      return res.json({
        success: true,
        role,
        message: `เข้าสู่ระบบสำเร็จในฐานะ ${role}`,
      });
    } else {
      // แสดงผลใน Backend Console เมื่อล็อกอินล้มเหลว
      console.log(`[LOGIN FAILED] Attempt by: ${username}`);

      return res.json({
        success: false,
        message: `❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (${authResult.message})`,
      });
    }
  } catch (err) {
    console.error("DB Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Database or Server error" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Close error:", err);
      }
    }
  }
});

app.get("/api/admin-data", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    const result = await connection.execute(`SELECT * FROM ADMIN`, [], {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });
    console.log("ADMIN from DB:", result.rows);
    res.json({ admin: result.rows });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Close error:", err);
      }
    }
  }
});
// Endpoint สำหรับดึงข้อมูลผู้ใช้ทั้งหมด (ไม่มีการป้องกันสิทธิ์)
app.get("/api/users", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // ✅ เพิ่ม ORDER BY เรียงตาม user_id
    const result = await connection.execute(
      `SELECT * FROM USERS 
       ORDER BY TO_NUMBER(SUBSTR(user_id, 6))`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log("USERS from DB:", result.rows);
    res.json({ users: result.rows });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Close error:", err);
      }
    }
  }
});
app.post("/api/add-users", async (req, res) => {
  console.log("📦 Body:", req.body);

  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "❌ Request body is empty",
    });
  }

  // ตัด Space ออก
  let { username, password_hash, first_name, last_name, email, phone } =
    req.body;

  username = username?.trim();
  first_name = first_name?.trim();
  last_name = last_name?.trim();
  email = email?.trim();
  phone = phone?.trim();

  if (!username || !password_hash || !first_name || !last_name || !email) {
    return res.status(400).json({
      message: "❌ Missing required fields",
    });
  }

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    // ✅ หาเลข user_id ล่าสุด (ใช้ ROWNUM แทน FETCH FIRST)
    const lastUser = await connection.execute(
      `SELECT * FROM (
         SELECT user_id FROM users 
         WHERE user_id LIKE 'user_%' 
         ORDER BY TO_NUMBER(SUBSTR(user_id, 6)) DESC
       ) WHERE ROWNUM = 1`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    // ✅ สร้าง user_id ใหม่
    let newUserId;
    if (lastUser.rows.length > 0) {
      const lastId = lastUser.rows[0].USER_ID;
      const lastNumber = parseInt(lastId.replace("user_", ""));
      const newNumber = lastNumber + 1;
      newUserId = `user_${String(newNumber).padStart(3, "0")}`;
    } else {
      newUserId = "user_001";
    }

    console.log("📝 New User ID:", newUserId);

    // ตรวจสอบ username ซ้ำ
    const checkUsername = await connection.execute(
      `SELECT username FROM users WHERE TRIM(username) = :username`,
      { username },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (checkUsername.rows.length > 0) {
      return res.status(400).json({ message: "❌ Username นี้ถูกใช้ไปแล้ว" });
    }

    // ตรวจสอบ email ซ้ำ
    const checkEmail = await connection.execute(
      `SELECT email FROM users WHERE TRIM(email) = :email`,
      { email },
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (checkEmail.rows.length > 0) {
      return res.status(400).json({ message: "❌ อีเมลนี้ถูกใช้ไปแล้ว" });
    }

    // Insert ข้อมูล
    await connection.execute(
      `INSERT INTO users (user_id, username, password_hash, first_name, last_name, email, phone, status)
       VALUES (:user_id, :username, :password_hash, :first_name, :last_name, :email, :phone, 'active')`,
      {
        user_id: newUserId,
        username,
        password_hash,
        first_name,
        last_name,
        email,
        phone,
      },
      { autoCommit: true }
    );

    res.json({ message: `✅ เพิ่มพนักงานสำเร็จ (${newUserId})` });
  } catch (err) {
    console.error("DB Error:", err);

    if (err.message.includes("ORA-00001")) {
      return res.status(400).json({
        message: "❌ ข้อมูลซ้ำ: Username หรืออีเมลนี้มีในระบบแล้ว",
      });
    }

    res
      .status(500)
      .json({ message: "❌ เกิดข้อผิดพลาดในฐานข้อมูล: " + err.message });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Close error:", err);
      }
    }
  }
});

app.post("/api/delete-user", async (req, res) => {
  const { username } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
      `DELETE FROM users WHERE username = :username`,
      { username },
      { autoCommit: true }
    );
    res.json({ message: "ลบผู้ใช้งานสำเร็จ" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Close error:", err);
      }
    }
  }
});

app.post("/api/update-user", async (req, res) => {
  const {
    user_id,
    username,
    password_hash,
    first_name,
    last_name,
    email,
    phone,
  } = req.body;

  console.log("📦 รับข้อมูล:", req.body); // ✅ log ตรวจสอบ

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `UPDATE users SET 
        password_hash = :password_hash,
        first_name = :first_name,
        last_name = :last_name,
        email = :email,
        phone = :phone
      WHERE user_id = :user_id AND username = :username`,
      { user_id, username, password_hash, first_name, last_name, email, phone },
      { autoCommit: true }
    );

    console.log("✅ อัปเดตแล้ว:", result.rowsAffected); // ✅ ตรวจว่าอัปเดตจริง

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้งานที่ต้องการแก้ไข" });
    }

    res.json({ message: "แก้ไขข้อมูลผู้ใช้งานสำเร็จ" });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "Database error" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Close error:", err);
      }
    }
  }
});

// ==================== GET: ดึงรายชื่อ Admin ====================
app.get("/api/admin", async (req, res) => {
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `SELECT NATIONAL_ID, USERNAME, FIRST_NAME, LAST_NAME, PHONE, POSITION_TITLE 
       FROM ADMIN 
       ORDER BY USERNAME`,
      [],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    console.log("ADMIN from DB:", result.rows);
    res.json({ admin: result.rows });
  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Close error:", err);
      }
    }
  }
});

// ==================== POST: เพิ่ม Admin ใหม่ ====================
app.post("/api/add-admin", async (req, res) => {
  let connection;
  try {
    const { national_id, username, password_hash, first_name, last_name, phone, position_title } = req.body;

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!national_id || !username || !password_hash || !first_name || !last_name || !phone || !position_title) {
      return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
    }

    // ตรวจสอบเลขบัตรประชาชน 13 หลัก
    if (!/^\d{13}$/.test(national_id)) {
      return res.status(400).json({ message: "เลขบัตรประชาชนต้องเป็นตัวเลข 13 หลัก" });
    }

    // ตรวจสอบเบอร์โทร 10 หลัก
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก" });
    }

    connection = await oracledb.getConnection(dbConfig);

    // ตรวจสอบว่า username ซ้ำหรือไม่
    const checkUsername = await connection.execute(
      `SELECT USERNAME FROM ADMIN WHERE USERNAME = :username`,
      [username],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (checkUsername.rows.length > 0) {
      return res.status(400).json({ message: "Username นี้ถูกใช้งานแล้ว" });
    }

    // ตรวจสอบว่าเลขบัตรประชาชนซ้ำหรือไม่
    const checkNationalId = await connection.execute(
      `SELECT NATIONAL_ID FROM ADMIN WHERE NATIONAL_ID = :national_id`,
      [national_id],
      { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    if (checkNationalId.rows.length > 0) {
      return res.status(400).json({ message: "เลขบัตรประชาชนนี้ถูกใช้งานแล้ว" });
    }

    // เพิ่มข้อมูล Admin ใหม่
    await connection.execute(
      `INSERT INTO ADMIN (NATIONAL_ID, USERNAME, PASSWORD, FIRST_NAME, LAST_NAME, PHONE, POSITION_TITLE) 
       VALUES (:national_id, :username, :password_hash, :first_name, :last_name, :phone, :position_title)`,
      {
        national_id,
        username,
        password_hash,
        first_name,
        last_name,
        phone,
        position_title
      },
      { autoCommit: true }
    );

    console.log("Admin added successfully:", username);
    res.status(201).json({ message: "เพิ่มผู้ดูแลระบบสำเร็จ" });

  } catch (err) {
    console.error("DB Error:", err);
    
    // จัดการ error จาก Oracle
    if (err.errorNum === 1) {
      return res.status(400).json({ message: "ข้อมูลซ้ำในระบบ" });
    }
    
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการเพิ่มผู้ดูแลระบบ" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Close error:", err);
      }
    }
  }
});

// ==================== DELETE: ลบ Admin (Optional) ====================
app.delete("/api/admin/:username", async (req, res) => {
  let connection;
  try {
    const { username } = req.params;

    connection = await oracledb.getConnection(dbConfig);

    const result = await connection.execute(
      `DELETE FROM ADMIN WHERE USERNAME = :username`,
      [username],
      { autoCommit: true }
    );

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ดูแลระบบนี้" });
    }

    console.log("Admin deleted:", username);
    res.json({ message: "ลบผู้ดูแลระบบสำเร็จ" });

  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการลบผู้ดูแลระบบ" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Close error:", err);
      }
    }
  }
});

// ==================== PUT: แก้ไขข้อมูล Admin (Optional) ====================
app.put("/api/admin/:username", async (req, res) => {
  let connection;
  try {
    const { username } = req.params;
    const { first_name, last_name, phone, position_title, password_hash } = req.body;

    connection = await oracledb.getConnection(dbConfig);

    // สร้าง SQL แบบ dynamic
    let sql = "UPDATE ADMIN SET ";
    const binds = { username };
    const updates = [];

    if (first_name) {
      updates.push("FIRST_NAME = :first_name");
      binds.first_name = first_name;
    }
    if (last_name) {
      updates.push("LAST_NAME = :last_name");
      binds.last_name = last_name;
    }
    if (phone) {
      updates.push("PHONE = :phone");
      binds.phone = phone;
    }
    if (position_title) {
      updates.push("POSITION_TITLE = :position_title");
      binds.position_title = position_title;
    }
    if (password_hash) {
      updates.push("PASSWORD = :password_hash");
      binds.password_hash = password_hash;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "ไม่มีข้อมูลที่ต้องการแก้ไข" });
    }

    sql += updates.join(", ") + " WHERE USERNAME = :username";

    const result = await connection.execute(sql, binds, { autoCommit: true });

    if (result.rowsAffected === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ดูแลระบบนี้" });
    }

    console.log("Admin updated:", username);
    res.json({ message: "แก้ไขข้อมูลสำเร็จ" });

  } catch (err) {
    console.error("DB Error:", err);
    res.status(500).json({ message: "เกิดข้อผิดพลาดในการแก้ไขข้อมูล" });
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("Close error:", err);
      }
    }
  }
});

  




initOracle();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

/// addmin admin001 1234 มันจะเป็น password_hash
/// superadmin superadmin 9999 มันจะเป็น password_hash

