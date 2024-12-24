import db from "@/lib/db";
import getSession from "@/lib/session";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { UserIcon } from "@heroicons/react/24/solid";
import { formatToWon } from "@/lib/utils";
import Link from "next/link";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";

async function getIsOwner(userId: number) {
  const session = await getSession();
  if (session.id) {
    return session.id === userId;
  }
  return false;
}

async function getProduct(id: number) {
  console.log("product");
  const product = await db.product.findUnique({
    where: {
      id,
    },
    include: {
      user: {
        select: {
          username: true,
          avatar: true,
        },
      },
    },
  });

  return product;
}

const getCashedProduct = nextCache(getProduct, ["product-detail"], {
  tags: ["product-detail", "xxxx"],
});

async function getProductTitle(id: number) {
  console.log("title");
  const product = await db.product.findUnique({
    where: {
      id,
    },
    select: {
      title: true,
    },
  });

  return product;
}

const getCachedProductTitle = nextCache(getProductTitle, ["product-title"], {
  tags: ["product-title", "xxxx"],
});

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getCachedProductTitle(Number(params.id));
  return {
    title: product?.title,
  };
}

export default async function ProductDetail({
  params,
}: {
  params: { id: string };
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

  const isOwner = await getIsOwner(product.userId);
  const revalidate = async () => {
    "use server";
    revalidateTag("xxxx");
  };

  const onDeleteProduct = async () => {
    "use server";
    await db.product.delete({
      where: {
        id: productId,
      },
      select: {
        id: true,
      },
    });
    redirect("/products");
  };
  return (
    <div className="pb-40">
      <div className="relative aspect-square">
        <Image
          fill
          className="object-cover"
          src={product.photo}
          // src={`${product.photo}/width=500,height=500`}
          alt={product.title}
        />
      </div>
      <div className="p-5 flex items-center gap-3 border-b border-x-neutral-700">
        <div className="size-10 overflow-hidden rounded-full">
          {product.user.avatar !== null ? (
            <Image
              src={product.user.avatar}
              width={40}
              height={40}
              alt={product.user.username}
            />
          ) : (
            <UserIcon />
          )}
        </div>
        <div>
          <h3>{product.user.username}</h3>
        </div>
      </div>
      <div className="p-5">
        <h1 className="text-2xl font-semibold">{product.title}</h1>
        <p>{product.description}</p>
      </div>
      <form action={revalidate}>
        <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
          Revalidate title cache
        </button>
      </form>
      <div className="fixed w-full bottom-0 p-5 pb-10 bg-neutral-800 flex justify-between items-center max-w-screen-sm">
        <span className="font-semibold text-xl">
          {formatToWon(product.price)}원
        </span>
        {isOwner ? (
          <form action={onDeleteProduct}>
            <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
              Delete product
            </button>
          </form>
        ) : null}
        <Link
          className="bg-orange-500 px-5 py-2.5 rounded-md text-white font-semibold"
          href={""}
        >
          채팅하기
        </Link>
      </div>
    </div>
  );
}
