var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TodoListSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    owner: {type: Schema.Types.ObjectId, ref: 'user' ,required :true},

    todos: [{type: Schema.Types.ObjectId, ref: 'todo'}],

    view:[{type: Schema.Types.ObjectId, ref: 'user'}],

    create:[{type: Schema.Types.ObjectId, ref: 'user'}],

    edit:[{type: Schema.Types.ObjectId, ref: 'user'}],

    delete:[{type: Schema.Types.ObjectId, ref: 'user'}]




});

module.exports = mongoose.model('todoList', TodoListSchema);
