const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

// Todo.remove({}).then((res) => {
//     console.log(res);
// });

Todo.findByIdAndRemove('599d213df3b8cc09b28cd594').then((todo) => {
    console.log(todo);
});
