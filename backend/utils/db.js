const oracledb = require("oracledb");

async function executeQuery(sql, params = {}) {
  let connection;

  try {
    connection = await oracledb.getConnection({
      user: DB_USER || "your_username",
      password: DB_PASSWORD || "your_password",
      connectString: DB_CONNECTION_STRING // หรือ SID ที่คุณใช้
    });

    const result = await connection.execute(sql, params, {
      outFormat: oracledb.OUT_FORMAT_OBJECT,
    });

    return result;
  } catch (err) {
    console.error("❌ DB Error:", err);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("❌ Error closing connection:", err);
      }
    }
  }
}

module.exports = { executeQuery };