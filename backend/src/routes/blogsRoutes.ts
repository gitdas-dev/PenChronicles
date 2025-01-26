import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@prisma/client/edge";
import { Hono } from "hono";
import { verify } from "hono/jwt";
import { createBlogInput, updateBlogInput } from "@das_mandeep321/meidum-common";

export const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    jwt_password: string;
  },
  Variables: {
    userId: string;
  }
}>();

blogRouter.use("/*", async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const user = await verify(authHeader || "", c.env.jwt_password);

  if(user){
    c.set("userId", user.id as string)
    await next()
  }else{
    c.status(411);
    return c.text("You need to log in! ")
  }
});


blogRouter.post("/", async (c) => {
  const body = await c.req.json();
  const { success } = createBlogInput.safeParse(body);
  
  if(!success){
    c.status(403);
    return c.text("Invalid blog inputs as checked!")
  }
  const userId = c.get("userId") as string;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
      },
    });
    return c.json({
      id: post.id,
    });
  } catch (error) {
    c.status(411);
    return c.json({ error: "Error creating post" });
  }
});

blogRouter.put("/", async (c) => {
  const body = await c.req.json();

  const { success } = updateBlogInput.safeParse(body);
  
  if(!success){
    c.status(403);
    return c.text("Invalid blog update inputs as checked!")
  }
  const userId = c.get("userId") as string;
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const post = prisma.post.update({
      where: {
        id: body.id,
        authorId: userId,
      },
      data: {
        title: body.title,
        content: body.content,
      },
    });

    return c.json(post);
  } catch (error) {
    c.status(411);
    return c.json({
      message: "Something went wrong while updating post!",
    });
  }
});

blogRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const posts = await prisma.post.findMany({});

    return c.json({ posts });
  } catch (error) {
    c.status(411);
    return c.json({
      message: "Error while getting all the blogs!",
    });
  }
});

blogRouter.get("/:id", async (c) => {
    const id = c.req.param("id");
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
    try {
      const post = await prisma.post.findUnique({
        where: {
          id,
        },
      });
  
      return c.json({ post });
    } catch (error) {}
    return c.text("get blog route");
  });
