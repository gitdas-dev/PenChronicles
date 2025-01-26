import z from "zod";

export const signupInput = z.object({
  username: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

//type inference in zod
export type signupType = z.infer<typeof signupInput>;

export const signinInput = z.object({
  username: z.string().email(),
  password: z.string().min(6),
});

//type inference in zod
export type signinType = z.infer<typeof signinInput>;

export const createBlogInput = z.object({
    title: z.string(),
    content: z.string()

})

export type createBlogType = z.infer<typeof createBlogInput>

export const updateBlogInput = z.object({
    title: z.string(),
    content: z.string(),
    id: z.number()

})

export type updateBlogType = z.infer<typeof updateBlogInput>
