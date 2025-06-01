import { headers as getHeaders } from "next/headers";
import { cookies as getCookies } from "next/headers";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { AUTH_COOKIE } from "../constants";
import { registerSchema } from "../schemas";
export const authRouter = createTRPCRouter({
  session: baseProcedure.query(async ({ ctx }) => {
    const headers = await getHeaders();
    const session = await ctx.db.auth({
      headers,
    });
    return session;
  }),
  logout: baseProcedure.mutation(async () => {
    const cookies = await getCookies();
    cookies.delete(AUTH_COOKIE);
  }),
  register: baseProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const existingData = await ctx.db.find({
        collection: "users",
        limit: 1,
        where: {
          username: {
            equals: input.username,
          },
        },
      });

      if (existingData.docs.length > 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Username already exists",
        });
      }

      await ctx.db.create({
        collection: "users",
        data: {
          email: input.email,
          password: input.password, // This will be hashed
          username: input.username,
        },
      });

      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        },
      });

      if (!data || !data.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const cookies = await getCookies();
      cookies.set({
        name: AUTH_COOKIE,
        value: data.token,
        httpOnly: true,
        path: "/",
        // sameSite: "none",
        // domain: ""
      });
    }),

  login: baseProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const data = await ctx.db.login({
        collection: "users",
        data: {
          email: input.email,
          password: input.password,
        },
      });

      if (!data || !data.token) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
        });
      }

      const cookies = await getCookies();
      cookies.set({
        name: AUTH_COOKIE,
        value: data.token,
        httpOnly: true,
        path: "/",
        // sameSite: "none",
        // domain: ""
      });
      return data;
    }),
});
