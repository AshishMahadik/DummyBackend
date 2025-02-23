const express = require('express');
const { employeeController } = require('../controller');
const { userAuth } = require('../middleware/authentication');

const router = express.Router();

router.use(userAuth());

router.post('/', employeeController.createEmployee); // Create Employee (Admin only)
router.get('/', employeeController.getEmployees); // Get All Employees (Protected)
router.get('/:id', employeeController.getEmployeeById); // Get Employee By ID (Protected)
router.put('/:id', employeeController.updateEmployee); // Update Employee (Admin only)
router.delete('/:id', employeeController.deleteEmployee); // Delete Employee (Admin only)

module.exports = router;
