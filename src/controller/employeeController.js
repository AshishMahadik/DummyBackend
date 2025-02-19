const Employee = require("../models/Employee");

// ✅ Create Employee
exports.createEmployee = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const { name, email, position, department, salary } = req.body;
        const existingEmployee = await Employee.findOne({ email });
        if (existingEmployee) return res.status(400).json({ message: "Employee already exists" });

        const employee = await Employee.create({ name, email, position, department, salary, createdBy: req.user.id });
        res.status(201).json(employee);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Get All Employees
exports.getEmployees = async (req, res) => {
    try {
        const employees = await Employee.find().populate("createdBy", "name email");
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Get Employee by ID
exports.getEmployeeById = async (req, res) => {
    try {
        const employee = await Employee.findById(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Update Employee
exports.updateEmployee = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Delete Employee
exports.deleteEmployee = async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }

        const employee = await Employee.findByIdAndDelete(req.params.id);
        if (!employee) return res.status(404).json({ message: "Employee not found" });

        res.json({ message: "Employee deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};
