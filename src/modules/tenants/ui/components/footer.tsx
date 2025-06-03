import { cn } from "@/lib/utils";
import { Poppins } from "next/font/google";
import Link from "next/link";
import React from "react";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const Footer = () => {
  return (
    <footer className="border-t font-medium bg-white py-4">
      <div className="max-w-(--breakpoint-xl) mx-auto h-full flex items-center gap-2 px-4 lg:px-12">
        <p className="text-black/50 text-sm font-light">Powered By</p>
        <Link href={"/"}>
          <p className={cn(poppins.className, "text-2xl font-semibold")}>
            MetaShopper.
          </p>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
