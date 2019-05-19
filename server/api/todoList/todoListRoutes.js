var router = require('express').Router();
var logger = require('../../util/logger');
var controller = require('./todoListController');
var auth = require('../../auth/auth');

var checkUser = [auth.decodeToken(), auth.getFreshUser()];
// setup boilerplate route just to satisfy a request for building
router.param('id', controller.params);

router.route('/')
    .get(controller.get)
    .post(checkUser, controller.post);

router.route('/:id')
    .get(controller.getOne)
    .put(checkUser, controller.put)
    .delete(checkUser, controller.delete);

router.route('/todos/:id')
    .post(checkUser, controller.add_todo)
    .delete(checkUser,controller.delete_todo);


router.route('/permissions/view/:id')
    .post(checkUser, controller.viewing_permission_add)
    .delete(checkUser, controller.viewing_permission_remove);

router.route('/permissions/create/:id')
    .post(checkUser, controller.creating_permission_add)
    .delete(checkUser, controller.creating_permission_remove);

router.route('/permissions/edit/:id')
    .post(checkUser, controller.edit_permission_add)
    .delete(checkUser, controller.edit_permission_remove);

router.route('/permissions/delete/:id')
    .post(checkUser, controller.delete_permission_add)
    .delete(checkUser, controller.delete_permission_remove);

module.exports = router;
