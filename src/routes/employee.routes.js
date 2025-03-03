const express = require('express');
const { employeeController } = require('../controller');
const { userAuth } = require('../middleware/authentication');

const router = express.Router();

router.use(userAuth());

router.post('/', employeeController.createEmployee);
router.get('/', employeeController.getEmployees);
router.get('/:id', employeeController.getEmployeeById);
router.put('/:id', employeeController.updateEmployee);
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;
