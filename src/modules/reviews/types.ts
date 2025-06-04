import { inferRouterOutputs } from "@trpc/server";

import { AppRouter } from "@/trpc/routers/_app";

export type ReviewGetOneOutput =
  inferRouterOutputs<AppRouter>["reviews"]["getOne"];
