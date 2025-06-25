const request = require('supertest');
const app = require('../app');

let token;
let taskId;

beforeAll(async () => {
  const res = await request(app)
    .post('/login')
    .send({ username: 'demo', password: 'demo123' });

  token = res.body.token;
});

describe('Task CRUD Tests', () => {
  it('should add a new task', async () => {
    const res = await request(app)
      .post('/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'משימה לבדיקה' });

    expect(res.statusCode).toBe(200);
    expect(res.body.task).toBeDefined();
    taskId = res.body.task._id;
  });

  it('should update the task', async () => {
    const res = await request(app)
      .put(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'משימה מעודכנת' });

    expect(res.statusCode).toBe(200);
    expect(res.body.task.title).toBe('משימה מעודכנת');
  });

  it('should delete the task', async () => {
    const res = await request(app)
      .delete(`/tasks/${taskId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('נמחק');
  });
});
