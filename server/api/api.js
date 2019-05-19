var router = require('express').Router();

// api router will mount other routers
// for all our resources
router.use('/users', require('./user/userRoutes'));
router.use('/todos', require('./todo/todoRoutes'));
router.use('/todolists', require('./todoList/todoListRoutes'));

module.exports = router;
