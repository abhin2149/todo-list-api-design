var Todo = require('./todoModel');
var TodoList = require('../todoList/todoListModel');
var _ = require('lodash');

exports.params = function (req, res, next, id) {
    Todo.findById(id)
        .select('-__v')
        .exec()
        .then(function (todo) {
            if (!todo) {
                next(new Error('No todo with that id'));
            } else {
                req.todo = todo;
                next();
            }
        }, function (err) {
            next(err);
        });
};

exports.get = function (req, res, next) {
    Todo.find({}).sort('priority')
        .select('-__v')
        .exec()
        .then(function (todos) {
            res.json(todos);
        }, function (err) {
            next(err);
        });
};

exports.getOne = function (req, res, next) {
    var todo = req.todo;
    res.json(todo);
};

exports.put = function (req, res, next) {
    var todo = req.todo;

    var update = req.body;

    _.merge(todo, update);

    todo.save(function (err, saved) {
        if (err) {
            next(err);
        } else {
            res.json(saved);
        }
    })
};

exports.post = function (req, res, next) {
    var newtodo = req.body;

    Todo.create(newtodo)
        .then(function (todo) {
            res.json(todo);
        }, function (err) {
            next(err);
        });
};

exports.delete = function (req, res, next) {
    req.todo.remove(function (err, removed) {
        if (err) {
            next(err);
        } else {
            res.json(removed);
        }
    });
};

exports.swap = function (req, res, next) {                        // to swap priorities of two todos with given ids in a given todolist
    var todo1, todo2;
    var user=req.user;
    TodoList.findById(req.body.todolist_id)
        .then(function (todolist) {
            if (!todolist) {
                next(new Error('Invalid todolist id'));
            } else {
                var flag = 0;
                todolist.edit.forEach(function (id) {
                    if (id.equals(user._id)) {
                        flag = 1;
                    }
                });

                if (flag === 1 || todolist.owner.equals(user._id)) {
                    Todo.findById(req.body.id1)
                        .then(function (firsttodo) {
                            if (!firsttodo) {
                                next(new Error('Invalid todo id'));
                            } else {
                                todo1 = firsttodo;
                                Todo.findById(req.body.id2)
                                    .then(function (secondtodo) {
                                        if (!secondtodo) {
                                            next(new Error('Invalid todo id'));
                                        }
                                        else {
                                            todo2 = secondtodo;
                                            var temp = todo1.priority;
                                            todo1.priority = todo2.priority;
                                            todo2.priority = 0;
                                            todo2.save(function (err, saved) {
                                                if (err) {
                                                    next(err);
                                                }
                                                else {
                                                    todo1.save(function (err, saved) {
                                                        if (err) {
                                                            next(err);
                                                        }
                                                        else {
                                                            todo2.priority = temp;
                                                            todo2.save(function (err, saved) {
                                                                if (err) {
                                                                    next(err);
                                                                }
                                                                else {
                                                                    res.json(todolist);
                                                                }
                                                            });
                                                        }
                                                    });

                                                }
                                            });

                                        }
                                    }, function (err) {
                                        next(err);
                                    });
                            }
                        }, function (err) {
                            next(err);
                        });
                }
                else {
                    res.status(401).send('You are not Authorized to edit this document');
                }
            }
        }, function (err) {
            next(err);
        });
};
