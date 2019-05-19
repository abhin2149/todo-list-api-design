var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TodoSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },

    priority: {
        type: Number,
        required: true,
        unique: true
    }
});

module.exports = mongoose.model('todo', TodoSchema);
