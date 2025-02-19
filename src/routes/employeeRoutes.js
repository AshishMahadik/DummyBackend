const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const {
    createEmployee,
    getEmployees,
    getEmployeeById,
    updateEmployee,
    deleteEmployee
} = require("../controller/employeeController");

const router = express.Router();

router.post("/", authMiddleware, createEmployee);       // Create Employee (Admin only)
router.get("/", authMiddleware, getEmployees);         // Get All Employees (Protected)
router.get("/:id", authMiddleware, getEmployeeById);   // Get Employee By ID (Protected)
router.put("/:id", authMiddleware, updateEmployee);    // Update Employee (Admin only)
router.delete("/:id", authMiddleware, deleteEmployee); // Delete Employee (Admin only)

module.exports = router;
