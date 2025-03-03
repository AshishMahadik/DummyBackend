const Employee = require('../models/Employee');
const { catchAsync } = require('../utils');

const createEmployee = catchAsync(async (req, res) => {
  try {
    // eslint-disable-next-line object-curly-newline
    const { name, email, position, department, salary } = req.body;
    const existingEmployee = await Employee.findOne({ email });
    if (existingEmployee) {
      return res.status(400).json({ message: 'Employee already exists' });
    }

    const employee = await Employee.create({
      name,
      email,
      position,
      department,
      salary,
      createdBy: req.user.id,
    });
    res.status(201).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// ✅ Get All Employees
const getEmployees = catchAsync(async (req, res) => {
  try {
    const employees = await Employee.find().populate('createdBy', 'name email');
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});
// ✅ Get Employee by ID
const getEmployeeById = catchAsync(async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// ✅ Update Employee
const updateEmployee = catchAsync(async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// ✅ Delete Employee
const deleteEmployee = catchAsync(async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
};
