const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('.');

describe('Auth Server /login endpoint', () => {
    it('should return a JWT for valid admin credentials', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'adminpass' });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();

        // Verify JWT structure and claims
        const decoded = jwt.verify(res.body.token, JWT_SECRET);
        expect(decoded.name).toBe('admin');
        expect(decoded['claims.jwt.hasura.io']['x-hasura-default-role']).toBe('admin');
        expect(decoded['claims.jwt.hasura.io']['x-hasura-user-id']).toBe('1');
    });

    it('should return a JWT for valid user credentials', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'user', password: 'userpass' });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();

        const decoded = jwt.verify(res.body.token, JWT_SECRET);
        expect(decoded.name).toBe('user');
        expect(decoded['claims.jwt.hasura.io']['x-hasura-default-role']).toBe('user');
        expect(decoded['claims.jwt.hasura.io']['x-hasura-user-id']).toBe('2');
    });

    it('should return 401 for invalid credentials', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'wrongpass' });

        expect(res.statusCode).toBe(401);
        expect(res.body.token).toBeUndefined();
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for missing credentials', async () => {
        const res = await request(app)
            .post('/login')
            .send({});

        expect(res.statusCode).toBe(401);
        expect(res.body.token).toBeUndefined();
        expect(res.body.message).toBe('Invalid credentials');
    });
});

const JWT_SECRET = process.env.JWT_SECRET;