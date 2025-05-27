const request = require('supertest');
const jwt = require('jsonwebtoken');
const { app, closeServer } = require('.');

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
        expect(decoded['claims.jwt.hasura.io']['x-hasura-user-id']).toBe('user-a1b2c3d4e5f6g7h8i9j0k1l2');
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
        expect(decoded['claims.jwt.hasura.io']['x-hasura-user-id']).toBe('user-b2c3d4e5f6g7h8i9j0k1l2m3');
    });

    it('should return a JWT for missing credentials with default user details', async () => {
        const res = await request(app)
            .post('/login')
            .send({});

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();

        const decoded = jwt.verify(res.body.token, JWT_SECRET);
        expect(decoded.name).toBe('guest');
        expect(decoded['claims.jwt.hasura.io']['x-hasura-default-role']).toBe('guest');
        expect(decoded['claims.jwt.hasura.io']['x-hasura-user-id']).toBe('user-c3d4e5f6g7h8i9j0k1l2m3n4');
        expect(decoded['claims.jwt.hasura.io']['x-hasura-tenant-id']).toBeDefined();
    });

    it('should return 401 when password is incorrect', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'wrongpass' });

        expect(res.statusCode).toBe(401);
        expect(res.body.message).toBe('Invalid credentials');
    });

    it('should include tenant-id in the JWT claims', async () => {
        const res = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'adminpass' });

        expect(res.statusCode).toBe(200);
        expect(res.body.token).toBeDefined();

        const decoded = jwt.verify(res.body.token, JWT_SECRET);
        expect(
            decoded['claims.jwt.hasura.io']['x-hasura-tenant-id']
        ).toBeDefined();
    });
});

afterAll(() => {
    closeServer();
});

const JWT_SECRET = process.env.JWT_SECRET;