"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavbarSidebar } from "./navbar-sidebar";
import { useState } from "react";
import { Loader2Icon, MenuIcon } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { useQuery } from "@tanstack/react-query";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["700"],
});

const navbarItems = [
  { href: "/", children: "Home" },
  { href: "/about", children: "About" },
  { href: "/features", children: "Features" },
  { href: "/pricing", children: "Pricing" },
  { href: "/contact", children: "Contact" },
];

interface NavbarItemProps {
  href: string;
  children: string;
  isActive?: boolean;
}

const NavbarItem = ({ href, children, isActive }: NavbarItemProps) => {
  return (
    <Button
      asChild
      variant="outline"
      className={cn(
        "bg-transparent hover:bg-transparent rounded-full hover:border-primary border-transparent px-3.5 text-lg",
        isActive && "bg-black text-white hover:bg-black hover:text-white"
      )}
    >
      <Link href={href}>{children}</Link>
    </Button>
  );
};

export const Navbar = () => {
  const pathname = usePathname();
  const trpc = useTRPC();
  const { data: session, isLoading } = useQuery(
    trpc.auth.session.queryOptions()
  );
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <nav className="h-20 flex border-b justify-between font-medium bg-white">
      <Link href="/" className="flex items-center pl-6">
        <span className={cn("text-5xl font-semibold", poppins.className)}>
          funroad
        </span>
      </Link>

      <NavbarSidebar
        items={navbarItems}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        authenticated={!!session?.user}
      />

      <div className="hidden lg:flex items-center gap-4">
        {navbarItems.map((item) => (
          <NavbarItem
            key={item.href}
            href={item.href}
            isActive={pathname === item.href}
          >
            {item.children}
          </NavbarItem>
        ))}
      </div>
      {isLoading && (
        <div className="animate-spin p-4 flex items-center justify-center">
          <Loader2Icon className="size-5 text-pink-400" />
        </div>
      )}
      {!isLoading && (
        <>
          {session?.user ? (
            <div className="hidden lg:flex">
              <Button
                asChild
                variant="secondary"
                className="border-l border-t-0  border-b-0 border-r-0 px-12 h-full rounded-none bg-white hover:bg-pink-400 transition-colors text-lg"
              >
                <Link href="/admin">Dashboard</Link>
              </Button>
            </div>
          ) : (
            <div className="hidden lg:flex">
              <Button
                asChild
                variant="secondary"
                className="border-l border-t-0  border-b-0 border-r-0 px-12 h-full rounded-none bg-white hover:bg-pink-400 transition-colors text-lg"
              >
                <Link prefetch href="/sign-in">
                  Login
                </Link>
              </Button>
              <Button
                asChild
                className="border-l border-t-0  border-b-0 border-r-0 px-12 h-full rounded-none bg-black hover:bg-pink-400 hover:text-black transition-colors text-lg"
              >
                <Link prefetch href="/sign-up">
                  Start selling
                </Link>
              </Button>
            </div>
          )}
        </>
      )}

      <div className="flex lg:hidden items-center justify-center">
        <Button
          variant="ghost"
          className="size-12 border-transparent bg-white mr-2"
          onClick={() => setIsSidebarOpen(true)}
        >
          <MenuIcon />
        </Button>
      </div>
    </nav>
  );
};
