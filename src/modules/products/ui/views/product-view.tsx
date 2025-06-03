"use client";

import StarRating from "@/components/global/star-rating";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { currencyFormatter, generateTenantUrl } from "@/lib/utils";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { LinkIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment } from "react";

interface Props {
  productId: string;
  tenantSlug: string;
}

export const ProductView = ({ productId, tenantSlug }: Props) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.products.getOne.queryOptions({ id: productId })
  );
  console.log("Product data:", data);

  return (
    <div className="px-4 lg:px-12 py-10">
      <div className="border rounded-sm bg-white overflow-hidden">
        <div className="relative aspect-[3.9] border-b">
          <Image
            src={data.image?.url || "/placeholder.png"}
            fill
            alt="cover"
            className="object-cover"
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-6">
          <div className="col-span-4">
            <div className="p-6">
              <h1 className="text-4xl font-medium">{data.name}</h1>
            </div>
            <div className="border-y flex">
              <div className="px-6 py-4 flex items-center justify-center border-r">
                <div className="px-2 py-1 border bg-yellow-300 w-fit">
                  <p className="text-base font-medium">
                    {currencyFormatter(data.price ?? 0)}
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 flex items-center justify-center lg:border-r">
                <Link
                  href={generateTenantUrl(tenantSlug)}
                  className="flex items-center gap-2"
                >
                  {/* {data.tenant?.image?.url && (
                    <Image
                      src={data.tenant.image.url}
                      alt={data.tenant.name}
                      width={20}
                      height={20}
                      className="rounded-full border size-[20px] shrink-0"
                    />
                  )}
                  <p className="text-base underline font-medium">
                    {data.tenant.name}
                  </p> */}
                  name
                </Link>
              </div>
              <div className="hidden lg:flex items-center justify-center px-6 py-4">
                <div className="flex items-center gap-1">
                  <StarRating rating={4} />
                </div>
              </div>
            </div>

            <div className="block lg:hidden px-6 py-4 items-center justify-center border-b">
              <div className="flex items-center gap-1">
                <StarRating rating={4} iconClassName="size-4" />
                <p className="text-base font-medium">{5} ratings</p>
              </div>
            </div>

            <div className="p-6 ">
              {data.description ? (
                <p className="text-base text-gray-700">{data.description}</p>
              ) : (
                <p className="text-base text-muted-foreground italic">
                  No description available for this product.
                </p>
              )}
            </div>
          </div>

          <div className="col-span-2">
            <div className="border-t lg:border-t-0 lg:border-l h-full">
              <div className="flex flex-col gap-4 p-6 border-b">
                <div className="flex flex-row items-center gap-2">
                  <Button variant={"elevated"} className="flex-1 bg-yellow-300">
                    Add to Cart
                  </Button>
                  <Button
                    variant={"elevated"}
                    className="size-12"
                    onClick={() => {}}
                    disabled={false}
                  >
                    <LinkIcon />
                  </Button>
                </div>
                <p className="text-center font-medium">
                  {data.refundPolicy === "no-refund"
                    ? "No Refunds"
                    : `${data.refundPolicy} money back guarantee`}
                </p>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium">Ratings</h3>
                  <div className="flex items-center gap-x-1 font-medium">
                    <StarIcon className="size-4 fill-amber-300" />
                    <p>({5})</p>
                    <p className="text-base">{5} ratings</p>
                  </div>
                </div>
                <div className="grid grid-cols-[auto_1fr_auto] gap-4 mt-4">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <Fragment key={rating}>
                      <div>
                        {rating} {rating === 1 ? "star" : "stars"}
                      </div>
                      <Progress value={25} className="h-[1lh]" />
                      <div className="font-medium">{0}%</div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
