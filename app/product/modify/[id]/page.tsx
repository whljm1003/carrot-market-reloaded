import ModifyProduct from "@/components/modifyProduct";
import { notFound } from "next/navigation";
import React from "react";
import { getCashedProduct, getProduct } from "./actions";

type Props = {};

export default async function ModifyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) {
    return notFound();
  }
  const product = await getCashedProduct(productId);
  if (!product) {
    return notFound();
  }
  // console.log(product);

  return <ModifyProduct product={product} />;
}
