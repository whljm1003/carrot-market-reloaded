import ProductList from "@/components/product-list";
import db from "@/lib/db";
import { Prisma } from "@prisma/client";
import Link from "next/link";
import React from "react";
import { PlusIcon } from "@heroicons/react/24/solid";
import { unstable_cache as nextCache, revalidatePath } from "next/cache";
import { PRODUCT_LIST_TAKE } from "@/lib/constants";

const getCashedProducts = nextCache(getInitialProducts, ["home-products"]);

async function getInitialProducts() {
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
    take: PRODUCT_LIST_TAKE,
    orderBy: {
      created_at: "desc",
    },
  });
  return products;
}

export type InitialProducts = Prisma.PromiseReturnType<
  typeof getInitialProducts
>;

// export const dynamic = "force-dynamic";
// export const revalidate = 60;

export default async function Products() {
  const initialProducts = await getInitialProducts();
  const revalidate = async () => {
    "use server";
    revalidatePath("/home");
  };

  return (
    <div>
      <ProductList initialProducts={initialProducts} />
      {/* <form action={revalidate}>
        <button>Revalidate</button>
      </form> */}
      <Link
        href="/product/add"
        className="bg-orange-500 flex items-center justify-center rounded-full size-16 fixed bottom-24 right-8 text-white transition-colors hover:bg-orange-400"
      >
        <PlusIcon className="size-10" />
      </Link>
    </div>
  );
}
