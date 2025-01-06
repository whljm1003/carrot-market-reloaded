"use server";

import { PRODUCT_LIST_TAKE } from "@/lib/constants";
import db from "@/lib/db";

export async function getMoreProducts(page: number) {
  const products = db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
    skip: page * PRODUCT_LIST_TAKE,
    take: PRODUCT_LIST_TAKE,
    orderBy: {
      created_at: "desc",
    },
  });
  return products;
}
