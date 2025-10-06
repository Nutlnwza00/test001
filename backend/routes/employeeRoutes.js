const express = require("express");
const router = express.Router();
const { executeQuery } = require("../utils/db");
const { authenticateToken, requireRole } = require("../middleware/auth");

router.get(
  "/employees",
  authenticateToken,
  requireRole("admin"),
  async (req, res) => {
    try {
      const result = await executeQuery(`
      SELECT 
        EMPLOYEE_ID AS id,
        FULL_NAME AS username,
        'พนักงานขับรถ' AS position,
        '089-xxx-xxxx' AS phone,
        'Inactive' AS status
      FROM EMPLOYEE
    `);

      const rows = Array.isArray(result?.rows) ? result.rows : result;
      res.json(rows);
    } catch (err) {
      console.error("❌ Error loading employees:", err.message);
      res.status(500).json({ error: "เกิดข้อผิดพลาดในการโหลดข้อมูลพนักงาน" });
    }
  }
);

module.exports = router;
