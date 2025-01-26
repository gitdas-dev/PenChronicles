import { withAccelerate } from "@prisma/extension-accelerate";
import { PrismaClient } from "@prisma/client/edge";
import { Hono } from "hono";
import { sign } from "hono/jwt";
import { signinInput, signupInput } from "@das_mandeep321/meidum-common";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    jwt_password: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const { success } = signupInput.safeParse(body);

  if(!success){
    c.status(403);
    return c.text("Invalid inputs as checked!")
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: body.username,
        name: body.name,
        password: body.password,
      },
    });

    const jwt = await sign(
      {
        id: user.id,
      },
      c.env.jwt_password
    );

    return c.json(jwt);
  } catch (error) {
    console.log(error);

    c.status(411);
    return c.text("User already exists!");
  }
});

userRouter.post("/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = await c.req.json();

  const { success } = signinInput.safeParse(body);

  if(!success){
    c.status(403);
    return c.text("Invalid inputs as checked!")
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.username,
        password: body.password, 
      }
    });
    
    if(!user) {
      c.status(403);
      return c.json({
        message: "Invalid user!"
      });
    }

    const jwt = await sign({
        id: user.id
    }, c.env.jwt_password)

    return c.json(jwt);
  } catch (error) {
    // Handle error
    console.log(error);
    c.status(411);
    return c.json({
        "message": "Oops! There is something wrong!"
    })
    
  }
});
