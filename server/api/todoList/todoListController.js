var TodoList = require('./todoListModel');
var _ = require('lodash');
var logger = require('../../util/logger');

exports.params = function (req, res, next, id) {
    TodoList.findById(id)
        .populate('owner', '-__v -password')
        .populate('todos', 'name priority', null, {sort: {priority: 1}})
        .select('-__v')
        .exec()
        .then(function (todoList) {
            if (!todoList) {
                next(new Error('No todoList with that id'));
            } else {
                req.todoList = todoList;
                next();
            }
        }, function (err) {
            next(err);
        });
};

exports.get = function (req, res, next) {
       TodoList.find({})
            .populate('owner', '-__v -password')
            .populate('todos', 'name priority', null, {sort: {priority: 1}})
            .select('-__v')
            .exec()
            .then(function (todoLists) {
                res.json(todoLists);
            }, function (err) {
                next(err);
            });

};

exports.getOne = function (req, res, next) {
    var user=req.user;
    var todolist = req.todoList;
    var flag = 0;
    todolist.view.forEach(function (id) {
        if (id.equals(user._id)) {
            flag = 1;
        }
    });

    if (flag === 1 || todolist.owner.equals(user._id)) {
        res.json(todolist);
    }
    else {
        res.status(401).send('You are not Authorized to view this document');
    }

};

exports.put = function (req, res, next) {
    var todolist = req.todoList;
    var user = req.user;

    var flag = 0;
    todolist.edit.forEach(function (id) {
        if (id.equals(user._id)) {
            flag = 1;
        }
    });

    if (flag === 1 || todolist.owner.equals(user._id)) {
        var update = req.body;

        _.merge(todolist, update);

        todolist.save(function (err, saved) {
            if (err) {
                next(err);
            } else {
                res.json(saved);
            }
        })    }
    else {
        res.status(401).send('You are not Authorized to edit this document');
    }

};

exports.post = function (req, res, next) {
    var newtodoList = req.body;
    newtodoList.owner = req.user._id;
    TodoList.create(newtodoList)
        .then(function (todoList) {
            res.json(todoList);
        }, function (err) {
            logger.error(err);
            next(err);
        });
};

exports.delete = function (req, res, next) {
    var user=req.user;
    var todolist=req.todoList;
    if(todolist.owner.equals(user._id)){
        todolist.remove(function (err, removed) {
            if (err) {
                next(err);
            } else {
                res.json(removed);
            }
        });
    }
    else{
        res.status(401).send('You are not Authorized to delete this document');
    }

};

exports.add_todo=function(req,res,next){
    var user=req.user;
    var todolist = req.todoList;
    var flag = 0;
    todolist.create.forEach(function (id) {
        if (id.equals(user._id)) {
            flag = 1;
        }
    });

    if (flag === 1 || todolist.owner.equals(user._id)) {
        flag=0;
        todolist.todos.forEach(function (id) {
            if (id.equals(req.body.todo_id)) {
                flag = 1;
                res.status(409).send('todo already present');
            }
        });

        if (flag === 0) {
            todolist.todos.unshift(req.body.todo_id);
            todolist.save(function (err, saved) {
                if (err) {
                    next(err);
                }
                else {
                    res.json(saved);
                }
            })
        }

    }
    else {
        res.status(401).send('You are not Authorized to add todos to this document');
    }
};

exports.delete_todo=function(req,res,next){
    var todolist = req.todoList;
    var user=req.user;
    var flag = 0;
    todolist.delete.forEach(function (id) {
        if (id.equals(user._id)) {
            flag = 1;
        }
    });

    if (flag === 1 || todolist.owner.equals(user._id)) {
        flag=0;
        var pos = -1;
        todolist.todos.forEach(function (id) {
            if (id.equals(req.body.todo_id)) {
                flag = 1;
                pos = _.findIndex(todolist.todos, {id: id});
            }
        });
        if (flag === 1) {
            todolist.todos.splice(pos, 1);
            todolist.save(function (err, saved) {
                if (err) {
                    next(err);
                }
                else {
                    res.json(saved);
                }
            })
        }
        else {
            res.status(404).send('id not found for deletion');
        }

    }
    else {
        res.status(401).send('You are not Authorized to delete todos from this document');
    }
};

exports.viewing_permission_add = function (req, res, next) {
    var todolist = req.todoList;
    var flag = 0;
    if (todolist.owner._id.equals(req.user._id)) {
        todolist.view.forEach(function (id) {
            if (id.equals(req.body.user_id)) {
                flag = 1;
                res.status(409).send('id already present');
            }
        });

        if (flag === 0) {
            todolist.view.unshift(req.body.user_id);
            todolist.save(function (err, saved) {
                if (err) {
                    next(err);
                }
                else {
                    res.json(saved);
                }
            })
        }
    }
    else {
        res.status(401).send('You are not Authorized to make changes to this document');
    }


};

exports.viewing_permission_remove = function (req, res, next) {
    var todolist = req.todoList;
    var flag = 0;
    var pos = -1;
    if (todolist.owner._id.equals(req.user._id)) {
        todolist.view.forEach(function (id) {
            if (id.equals(req.body.user_id)) {
                flag = 1;
                pos = _.findIndex(todolist.view, {id: id});
            }
        });
        if (flag === 1) {
            todolist.view.splice(pos, 1);
            todolist.save(function (err, saved) {
                if (err) {
                    next(err);
                }
                else {
                    res.json(saved);
                }
            })
        }
        else {
            res.status(404).send('id not found for deletion');
        }

    }
    else {
        res.status(401).send('You are not Authorized to make changes to this document');
    }
};

//

exports.creating_permission_add = function (req, res, next) {
    var todolist = req.todoList;
    var flag = 0;
    if (todolist.owner._id.equals(req.user._id)) {
        todolist.create.forEach(function (id) {
            if (id.equals(req.body.user_id)) {
                flag = 1;
                res.status(409).send('id already present');
            }
        });

        if (flag === 0) {
            todolist.create.unshift(req.body.user_id);
            todolist.save(function (err, saved) {
                if (err) {
                    next(err);
                }
                else {
                    res.json(saved);
                }
            })
        }

    }
    else {
        res.status(401).send('You are not Authorized to make changes to this document');
    }


};

exports.creating_permission_remove = function (req, res, next) {
    var todolist = req.todoList;
    var flag = 0;
    var pos = -1;
    if (todolist.owner._id.equals(req.user._id)) {
        todolist.create.forEach(function (id) {
            if (id.equals(req.body.user_id)) {
                flag = 1;
                pos = _.findIndex(todolist.create, {id: id});
            }
        });
        if (flag === 1) {
            todolist.create.splice(pos, 1);
            todolist.save(function (err, saved) {
                if (err) {
                    next(err);
                }
                else {
                    res.json(saved);
                }
            })
        }
        else {
            res.status(404).send('id not found for deletion');
        }
    }
    else {
        res.status(401).send('You are not Authorized to make changes to this document');
    }
};

//

exports.edit_permission_add = function (req, res, next) {
    var todolist = req.todoList;
    var flag = 0;
    if (todolist.owner._id.equals(req.user._id)) {
        todolist.edit.forEach(function (id) {
            if (id.equals(req.body.user_id)) {
                flag = 1;
                res.status(409).send('id already present');

            }
        });

        if (flag === 0) {
            todolist.edit.unshift(req.body.user_id);
            todolist.save(function (err, saved) {
                if (err) {
                    next(err);
                }
                else {
                    res.json(saved);
                }
            })
        }

    }
    else {
        res.status(401).send('You are not Authorized to make changes to this document');
    }


};

exports.edit_permission_remove = function (req, res, next) {
    var todolist = req.todoList;
    var flag = 0;
    var pos = -1;
    if (todolist.owner._id.equals(req.user._id)) {
        todolist.edit.forEach(function (id) {
            if (id.equals(req.body.user_id)) {
                flag = 1;
                pos = _.findIndex(todolist.edit, {id: id});
            }
        });
        if (flag === 1) {
            todolist.edit.splice(pos, 1);
            todolist.save(function (err, saved) {
                if (err) {
                    next(err);
                }
                else {
                    res.json(saved);
                }
            })
        }
        else {
            res.status(404).send('id not found for deletion');
        }
    }
    else {
        res.status(401).send('You are not Authorized to make changes to this document');
    }
};

//

exports.delete_permission_add = function (req, res, next) {
    var todolist = req.todoList;
    var flag = 0;
    if (todolist.owner._id.equals(req.user._id)) {
        todolist.delete.forEach(function (id) {
            if (id.equals(req.body.user_id)) {
                flag = 1;
                res.status(409).send('id already present');

            }
        });

        if (flag === 0) {
            todolist.delete.unshift(req.body.user_id);
            todolist.save(function (err, saved) {
                if (err) {
                    next(err);
                }
                else {
                    res.json(saved);
                }
            })
        }

    }
    else {
        res.status(401).send('You are not Authorized to make changes to this document');
    }


};

exports.delete_permission_remove = function (req, res, next) {
    var todolist = req.todoList;
    var flag = 0;
    var pos = -1;
    if (todolist.owner._id.equals(req.user._id)) {
        todolist.delete.forEach(function (id) {
            if (id.equals(req.body.user_id)) {
                flag = 1;
                pos = _.findIndex(todolist.delete, {id: id});
            }
        });
        if (flag === 1) {
            todolist.delete.splice(pos, 1);
            todolist.save(function (err, saved) {
                if (err) {
                    next(err);
                }
                else {
                    res.json(saved);
                }
            })
        }
        else {
            res.status(404).send('id not found for deletion');
        }
    }
    else {
        res.status(401).send('You are not Authorized to make changes to this document');
    }
};