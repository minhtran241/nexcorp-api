import { Elysia } from 'elysia';
import { postsHandler } from '~handlers/PostsHandler';
import { isAuthenticated, isAdmin } from '~middlewares/Auth';

// Usage in route configuration
export const configurePostsRoutes = new Elysia({ prefix: '/post' })
    .get('/', postsHandler.getPosts)
    .post('/', postsHandler.createPost, {
        beforeHandle: [isAuthenticated, isAdmin],
        body: postsHandler.validateCreatePost,
    })
    .get('/:slug', postsHandler.getPost)
    .delete('/:id', postsHandler.deletePost, {
        beforeHandle: [isAuthenticated, isAdmin],
    })
    // get view count of a post
    .get('/:slug/view', postsHandler.getPostViewCount);
