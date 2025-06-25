const request = require('supertest');
const app = require('../app'); // חשוב: לא server.js!

describe('Auth Tests', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        username: 'testuser_' + Date.now(), // מונע כפילויות
        password: 'testpass'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe('נרשמת בהצלחה');
  });

  it('should login and return a token', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        username: 'demo',
        password: 'demo123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});
