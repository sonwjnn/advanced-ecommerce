import { getPayload } from "payload";
import { Footer } from "./footer";
import { Navbar } from "./navbar";
import { SearchFilter } from "./search-filter";
import configPromise from "@payload-config";
import { Category } from "@/payload-types";

const HomeLayout = async ({ children }: { children: React.ReactNode }) => {
  const payload = await getPayload({
    config: configPromise,
  });

  const data = await payload.find({
    collection: "categories",
    depth: 1,
    where: {
      parent: {
        exists: false,
      },
    },
  });

  const formattedData = data.docs.map((doc) => ({
    ...doc,
    subcategories: (doc.subcategories?.docs ?? []).map((doc) => ({
      ...(doc as Category),
      subcategories: undefined,
    })),
  }));

  console.log(data);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <SearchFilter data={formattedData} />
      <div className="flex-1 bg-[#F4F4F0]">{children}</div>
      <Footer />
    </div>
  );
};

export default HomeLayout;
