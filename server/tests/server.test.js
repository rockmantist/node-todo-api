const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {todos, populateTodos, user, populateUsers} = require('./seed/seed');

beforeEach(populateTodos);
beforeEach(populateUsers);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo';

        request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send({text})
        .expect(200)
        .expect((res) => {
            expect(res.body.text).toBe(text);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.find({text}).then((todos) => {
                expect(todos.length).toBe(1);
                expect(todos[0].text).toBe(text);
                done();
            }).catch((e) => done(e));
        });
    });

    it('shoud not create todo with invalid body data', (done) => {
        request(app)
        .post('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .send({})
        .expect(400)
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.find().then((todos) => {
                expect(todos.length).toBe(2);
                done();
            }).catch((e) => done(e));
        });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
        .get('/todos')
        .set('x-auth', users[0].tokens[0].token)
        .expect(200)
        .expect((res) => {
            expect(res.body.todos.length).toBe(1);
        })
        .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should return todo doc', (done) => {
        request(app)
        .get(`/todos/${todos[0]._id.toHexString()}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toBe(todos[0].text);
        })
        .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        var id = new ObjectID().toHexString();

        request(app)
        .get(`/todos/${id}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 for non-object id', (done) => {
        var id = '123';

        request(app)
        .get(`/todos/${id}`)
        .expect(404)
        .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        var id = todos[1]._id.toHexString();

        request(app)
        .delete(`/todos/${id}`)
        .expect(200)
        .expect((res) => {
            expect(res.body.todo._id).toBe(id);
        })
        .end((err, res) => {
            if (err) {
                return done(err);
            }

            Todo.findById(id).then((todo) => {
                expect(todo).toNotExist()
                done();
            }).catch((e) => done(e));
        });
    });

    it('should return 404 if todo not found', (done) => {
        var id = new ObjectID().toHexString();

        request(app)
        .delete(`/todos/${id}`)
        .expect(404)
        .end(done);
    });

    it('should return 404 for non-object id', (done) => {
        var id = '123';

        request(app)
        .delete(`/todos/${id}`)
        .expect(404)
        .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update todo', (done) => {
        var id = todos[0]._id.toHexString();

        request(app)
        .patch(`/todos/${id}`)
        .send({
            completed: true,
            text: "Form text cas"
        })
        .expect(200)
        .expect((res) => {
            expect(res.body.todo.text).toNotBe(todos[0].text);
            expect(res.body.todo.completed).toBe(true);
            expect(res.body.todo.completedAt).toBeA('number');
        })
        .end(done);
    });

    // it('should clear completedAt when todo is not completed', (done) => {
    //
    // });
});
