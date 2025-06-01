import "./globals.css";

import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import { TRPCReactProvider } from "@/trpc/client";
import { Toaster } from "@/components/ui/sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
const dmSans = DM_Sans({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Multitenant Ecommerce",
  description: "Multitenant Ecommerce",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.className} antialiased`}>
        <NuqsAdapter>
          <TRPCReactProvider>
            <Toaster />
            {children}
          </TRPCReactProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
