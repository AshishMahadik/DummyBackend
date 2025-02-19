const express = require('express');

const { viewController } = require('../controller');

const router = express.Router();

router.route('/email').get(viewController.emailBox);

router.route('/email/:email').get(viewController.emailList);

router.route('/email/view/:id').get(viewController.emailView);



module.exports = router;
