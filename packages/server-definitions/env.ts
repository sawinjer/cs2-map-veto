import z from "zod";

export const env = z
  .object({
    REDIS_URL: z.string().nonempty().startsWith("redis://"),
    SECRET: z.string().nonempty(),
    OPENHUD_URL: z.url().optional(),
  })
  .parse(process.env);
