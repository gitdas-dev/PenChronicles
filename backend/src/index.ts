import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate';
import { Hono } from 'hono';
import { userRouter } from './routes/usersRoutes';
import { blogRouter } from './routes/blogsRoutes';

// Create the main Hono app
const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
  };
}>(); 



app.route('/api/v1/user', userRouter)
app.route('/api/v1/blog', blogRouter)



export default app;
