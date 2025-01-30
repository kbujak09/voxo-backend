const request = require('supertest');
const express = require('express');
const usersRoutes = require('../../routes/users');

jest.mock('../../controllers/userController', () => ({
  getUsers: (req, res) => res.json([{ id: '1', username: 'John Doe' }]),
  getUserById: (req, res) => res.json({ id: req.params.userId, username: 'John Doe' }),
  getUserByUsername: (req, res) => res.json({ id: '1', username: req.params.username })
}));

const app = express();
app.use('/', usersRoutes);

describe('Users Routes', () => {
  test('GET /users should return an array of users', async () => {
    const res = await request(app).get('/users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('username', 'John Doe');
    expect(res.body[0]).toHaveProperty('id', '1');
  });

  test('GET /users/id/:userId should return a user object', async () => {
    const testId = 'testId';
    const res = await request(app).get(`/users/id/${testId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', testId);
    expect(res.body).toHaveProperty('username', 'John Doe');
  });
  
  test('GET /users/username/:username should return a user object', async () => {
    const testUsername = 'testUsername';
    const res = await request(app).get(`/users/username/${testUsername}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username', testUsername);
    expect(res.body).toHaveProperty('id', '1');
  });
});