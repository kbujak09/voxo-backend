const express = require('express');
const request = require('supertest');

const User = require('../../models/user');
const { 
  getUserById, 
  getUserByUsername, 
  getUsers } = require('../../controllers/userController'); 

jest.mock('../../models/user');

const app = express();
app.use(express.json());
app.get('/users/id/:userId', getUserById);
app.get('/users/username/:username', getUserByUsername);
app.get('/users', getUsers);

describe('User Controller Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserById', () => {
    it('should return 404 if userId is not provided', async () => {
      const res = await request(app).get('/users/id');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({});
    });

    it('should return 404 if user is not found', async () => {
      User.findById.mockResolvedValue(null);

      const res = await request(app).get('/users/id/123');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'User not found' });
      expect(User.findById).toHaveBeenCalledWith('123');
    });

    it('should return 200 with the user data if user is found', async () => {
      const mockUser = { _id: '01', username: 'test' };
      User.findById.mockResolvedValue(mockUser);

      const res = await request(app).get('/users/id/01');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
      expect(User.findById).toHaveBeenCalledWith('01');
    });

    it('should handle request errors', async () => {
      User.findById.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/users/id/123');
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Error while fetching user by ID/);
    });
  });

  describe('getUserByUsername', () => {
    it('should return 404 if username is not provided', async () => {
      const res = await request(app).get('/users/username');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({});
    });

    it('should return 404 if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const res = await request(app).get('/users/username/test');
      expect(res.status).toBe(404);
      expect(res.body).toEqual({ error: 'User not found' });
      expect(User.findOne).toHaveBeenCalledWith({ username: 'test' });
    });

    it('should return 200 with the user data if user is found', async () => {
      const mockUser = { _id: '01', username: 'test' };
      User.findOne.mockResolvedValue(mockUser);

      const res = await request(app).get('/users/username/test');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockUser);
      expect(User.findOne).toHaveBeenCalledWith({ username: 'test' });
    });

    it('should handle request errors', async () => {
      User.findOne.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/users/username/test');
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Error while fetching user by username/);
    });
  });

  describe('getUsers', () => {
    it('should return 200 with the users data', async () => {
      const mockUser01 = { _id: '01', username: 'test01' };
      const mockUser02 = { _id: '02', username: 'test02' };
      User.find.mockResolvedValue([mockUser01, mockUser02]);

      const res = await request(app).get('/users');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([mockUser01, mockUser02]);
      expect(User.find).toHaveBeenCalledWith();
    });

    it('should handle request errors', async () => {
      User.find.mockRejectedValue(new Error('Database error'));

      const res = await request(app).get('/users');
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/Error while fetching all users/);
    });
  });
});


