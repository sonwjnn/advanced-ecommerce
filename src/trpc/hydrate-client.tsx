"server-only";

import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "./server";

export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}
