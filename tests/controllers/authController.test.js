const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const authController = require('../../controllers/authController');
const User = require('../../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('passport');

describe('Auth controller', () => {
  const originalFindOne = User.findOne;

  beforeEach(async () => {
    await User.deleteMany();
    User.findOne = originalFindOne;
  });

  describe('Signup', () => {
    it('should create a new user successfully', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'testpassword',
          confirmPassword: 'testpassword'
        }
      };

      bcrypt.hash.mockImplementation((password, saltRounds, cb) => cb(null, 'hashedpassword'));

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      await authController.signup[authController.signup.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'User created successfully!' });

      const user = await User.findOne({ username: 'testuser' });
      expect(user).not.toBeNull();
      expect(user.password).toBe('hashedpassword');
    });

    it('return status 403 when user exists', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'testpassword',
          confirmPassword: 'testpassword'
        }
      };

      User.findOne = jest.fn().mockResolvedValue({ username: 'testuser' });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      await authController.signup[authController.signup.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        username: 'testuser',
        errors: [{ message: 'Username is taken' }]
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('user exists regex is case insensitive', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'testpassword',
          confirmPassword: 'testpassword'
        }
      };

      User.findOne = jest.fn().mockReturnValue({ username: 'TestUser' });

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      const next = jest.fn();

      await authController.signup[authController.signup.length - 1](req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        username: 'testuser',
        errors: [{ message: 'Username is taken' }]
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Signup - validation', () => {
    let res, next;

    beforeEach(() => {
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it('validation error when username is empty', async () => {
      const req = {
        body: {
          username: '',
          password: 'testpassword',
          confirmPassword: 'testpassword'
        }
      };

      for (const middleware of authController.signup) {
        await middleware(req, res, next);
      }

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        username: '',
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Username can not be empty.' })
        ])
      });
    });

    it('validation error when username contains spaces', async () => {
      const req = {
        body: {
          username: 'test user',
          password: 'testpassword',
          confirmPassword: 'testpassword'
        }
      };

      for (const middleware of authController.signup) {
        await middleware(req, res, next);
      }

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        username: 'test user',
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'No spaces are allowed in the username.' })
        ])
      });
    });

    it('validation error when username is shorter than 3 characters', async () => {
      const req = {
        body: {
          username: 'te',
          password: 'testpassword',
          confirmPassword: 'testpassword'
        }
      };

      for (const middleware of authController.signup) {
        await middleware(req, res, next);
      }

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        username: 'te',
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Username must contain at least 3 characters.' })
        ])
      });
    });

    it('validation error when username is shorter than 3 characters', async () => {
      const req = {
        body: {
          username: 'testusertestuser2',
          password: 'testpassword',
          confirmPassword: 'testpassword'
        }
      };

      for (const middleware of authController.signup) {
        await middleware(req, res, next);
      }

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        username: 'testusertestuser2',
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Username can not be longer than 16 characters.' })
        ])
      });
    });

    it('validation error when username is longer than 16 characters', async () => {
      const req = {
        body: {
          username: 'testusertestuser2',
          password: 'testpassword',
          confirmPassword: 'testpassword'
        }
      };

      for (const middleware of authController.signup) {
        await middleware(req, res, next);
      }

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        username: 'testusertestuser2',
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Username can not be longer than 16 characters.' })
        ])
      });
    });

    it('validation error when password is empty', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: '',
          confirmPassword: 'testpassword'
        }
      };

      for (const middleware of authController.signup) {
        await middleware(req, res, next);
      }

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        username: 'testuser',
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Password can not be empty.' })
        ])
      });
    });

    it('validation error when password contain spaces', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'test password',
          confirmPassword: 'test password'
        }
      };

      for (const middleware of authController.signup) {
        await middleware(req, res, next);
      }

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        username: 'testuser',
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'No spaces are allowed in the password.' })
        ])
      });
    });

    it('validation error when password is shorter than 8 characters', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'testpa',
          confirmPassword: 'testpa'
        }
      };

      for (const middleware of authController.signup) {
        await middleware(req, res, next);
      }

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        username: 'testuser',
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Password must contain at least 8 characters.' })
        ])
      });
    });

    it('validation error when password is shorter than 8 characters', async () => {
      const req = {
        body: {
          username: 'testuser',
          password: 'testpassword',
          confirmPassword: 'testpa'
        }
      };

      for (const middleware of authController.signup) {
        await middleware(req, res, next);
      }

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        username: 'testuser',
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Passwords do not match.' })
        ])
      });
    });
  });
});
