import { Elysia } from 'elysia';
import { rateLimit } from 'elysia-rate-limit';
import { cron } from '@elysiajs/cron';
import { serverTiming } from '@elysiajs/server-timing';
import APIError from './errors/APIError';
import { rateLimitExceeded } from './messages/failure';
import bearer from '@elysiajs/bearer';
import cookie from '@elysiajs/cookie';
import jwt from '@elysiajs/jwt';
import { configureAuthRoutes } from './routes/AuthRoute';
import { configureHealthRoutes } from './routes/HealthRoute';
import { configureUsersRoutes } from './routes/UsersRoute';
import { configurePostsRoutes } from './routes/PostsRoute';
import cors from '@elysiajs/cors';

const app = new Elysia();
const API_PORT = parseInt(process.env.API_PORT || '8080');

const jwtConfig = {
    secret: process.env.JWT_SECRET || 'secret',
    alg: 'HS256',
    // exp: 60 * 60 * 24, // 1 day expiration
    iss: 'nextcorp',
    sub: 'access',
    iat: new Date().getTime(),
};

const refreshJwtConfig = {
    secret: process.env.JWT_REFRESH || 'refresh',
    alg: 'HS256',
    exp: 60 * 60 * 24 * 365, // 1 year expiration
    iss: 'nextcorp',
    sub: 'refresh',
    iat: new Date().getTime(),
};

const errorHandler = ({ error, set }: { error: Error; set: any }) => {
    let status;
    switch (set.code) {
        case 'NOT_FOUND':
            status = 404;
            break;
        case 'INTERNAL_SERVER_ERROR':
            status = 500;
            break;
        case 'INVALID_COOKIE_SIGNATURE':
            status = 401;
            break;
        case 'VALIDATION':
            status = 400;
            break;
        default:
            status = 500;
            break;
    }
    set.status = status;
    return {
        status: set.status,
        message:
            error instanceof APIError
                ? error.message
                : error.message || 'Unknown error',
        timestamp: new Date(),
    };
};

app.onError(errorHandler)
    .use(cors())
    .use(jwt({ name: 'jwt', ...jwtConfig }))
    .use(jwt({ name: 'refreshJwt', ...refreshJwtConfig }))
    .use(cookie())
    .use(bearer())
    .use(serverTiming())
    .use(
        rateLimit({
            duration: 60 * 1000, // 1 minute
            max: 100,
            responseMessage: rateLimitExceeded,
        })
    );

if (process.env.ENV === 'prod') {
    app.use(
        cron({
            name: 'heartbeat',
            pattern: '*/10 * * * * *',
            run() {
                const systemInfo = {
                    cpu: process.cpuUsage(),
                    memory: process.memoryUsage(),
                    uptime: process.uptime(),
                    port: API_PORT,
                    heartbeat: new Date(),
                };
                console.log(systemInfo);
            },
        })
    );
}

app.use(configureHealthRoutes)
    .use(configureAuthRoutes)
    .use(configureUsersRoutes)
    .use(configurePostsRoutes);

app.get('/', () => `Welcome to Bun Elysia`).listen(API_PORT, () => {
    console.log(`🦊 Elysia is running at ${app.server?.hostname}:${API_PORT}`);
});
