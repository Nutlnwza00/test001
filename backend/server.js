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
    { name: 'superadmin', table: 'SUPERADMIN' },
    { name: 'admin', table: 'ADMIN' },
    { name: 'users', table: 'USERS' }
  ];

  for (const roleInfo of roles) {
    try {
      // ดึงข้อมูลผู้ใช้ตาม Username จากตารางที่กำหนด (ดึง PASSWORD_HASH)
      const result = await connection.execute(
        `SELECT * FROM ${roleInfo.table} WHERE USERNAME = :un`,
        { un: username },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (result.rows.length > 0) {
        const user = result.rows[0];
        // ตรวจสอบรหัสผ่านด้วย bcryptjs
        const passwordMatch = await bcrypt.compare(password, user.PASSWORD_HASH);
        if (passwordMatch) {
          // ล็อกอินสำเร็จ คืนข้อมูลผู้ใช้และ Role
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
            message: `เข้าสู่ระบบสำเร็จในฐานะ ${role}` 
        });
    } else {
  // แสดงผลใน Backend Console เมื่อล็อกอินล้มเหลว
        console.log(`[LOGIN FAILED] Attempt by: ${username}`);
        
        return res.json({ success: false, message: `❌ ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง (${authResult.message})` }); 
    }
  } catch (err) {
    console.error("DB Error:", err); 
    res.status(500).json({ success: false, message: "Database or Server error" });
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
  // ✅ แก้ไขให้ตรงกับ add-users
  const {
    user_id,
    username,
    password_hash,
    first_name,
    last_name,
    email,
    phone,
  } = req.body;
  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    await connection.execute(
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

initOracle(); 

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});




