import ListProduct from "@/components/list-product";
import db from "@/lib/db";
import getSession from "@/lib/session";
import React, { useEffect } from "react";

async function getProduct() {
  const products = await db.product.findMany({
    select: {
      title: true,
      price: true,
      created_at: true,
      photo: true,
      id: true,
    },
  });
  return products;
}

export default async function Products() {
  const products = await getProduct();

  return (
    <div className="p-5 flex flex-col gap-5">
      {products.map((product) => (
        <ListProduct key={product.id} {...product} />
      ))}
    </div>
  );
}
