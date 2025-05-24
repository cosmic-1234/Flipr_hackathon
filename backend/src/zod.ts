import zod from "zod";

export const USER_BODY = zod.object({
  username: zod.string(),
  email: zod.string().email(),
  password: zod.string(),
});

export const SIGNIN_BODY = zod.object({
  email: zod.string().email(),
  password: zod.string(),
})