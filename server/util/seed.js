var User = require('../api/user/userModel');
var TodoList = require('../api/todoList/todoListModel');
var Todo = require('../api/todo/todoModel');
var _ = require('lodash');
var logger = require('./logger');

logger.log('Seeding the Database');

var users = [
  {username: 'Jimmylo', password: 'test'},
  {username: 'Xoko', password: 'test'},
  {username: 'katamon', password: 'test'}
];

var todos = [
  {name: 'intros', priority: 1},
  {name: 'angular', priority: 2},
  {name: 'UI/UX', priority: 3}
];

var todoLists = [
  {name: 'Project 1'},
  {name: 'Project 2'},
  {name: 'Project 3'}
];

var createDoc = function(model, doc) {
  return new Promise(function(resolve, reject) {
    new model(doc).save(function(err, saved) {
      return err ? reject(err) : resolve(saved);
    });
  });
};

var cleanDB = function() {
  logger.log('... cleaning the DB');
  var cleanPromises = [User, Todo, TodoList]
    .map(function(model) {
      return model.remove().exec();
    });
  return Promise.all(cleanPromises);
}

var createUsers = function(data) {

  var promises = users.map(function(user) {
    return createDoc(User, user);
  });

  return Promise.all(promises)
    .then(function(users) {
      return _.merge({users: users}, data || {});
    });
};

var createTodos = function(data) {
  var promises = todos.map(function(todo) {
    return createDoc(Todo, todo);
  });

  return Promise.all(promises)
    .then(function(todos) {
      return _.merge({todos: todos}, data || {});
    });
};

var createTodoLists = function(data) {
  var addTodo = function(todoList, todo) {
    todoList.todos.push(todo);

    return new Promise(function(resolve, reject) {
      todoList.save(function(err, saved) {
        return err ? reject(err) : resolve(saved)
      });
    });
  };

  var newTodoLists = todoLists.map(function(todoList, i) {
    todoList.owner = data.users[i]._id;
    return createDoc(TodoList, todoList);
  });

  return Promise.all(newTodoLists)
    .then(function(savedTodoLists) {
      return Promise.all(savedTodoLists.map(function(todoList, i){
        return addTodo(todoList, data.todos[i])
      }));
    })
    .then(function() {
      return 'Seeded DB with 3 TodoLists, 3 Users, 3 Todos';
    });
};

cleanDB()
  .then(createUsers)
  .then(createTodos)
  .then(createTodoLists)
  .then(logger.log.bind(logger))
  .catch(logger.log.bind(logger));
