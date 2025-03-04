import db from "@/lib/db";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ArrowLeftCircleIcon, UserIcon } from "@heroicons/react/24/solid";
import { formatToWon } from "@/lib/utils";
import Link from "next/link";
import { unstable_cache as nextCache, revalidateTag } from "next/cache";
import ChatForm from "@/components/chat-form";

async function getIsOwner(userId: number) {
  // const session = await getSession();
  // if (session.id) {
  //   return session.id === userId;
  // }
  return false;
}

async function getProduct(id: number) {
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
  tags: ["product-detail"],
});

async function getProductTitle(id: number) {
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
  tags: ["product-title"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getCachedProductTitle(Number(id));
  return {
    title: product?.title,
  };
}

export default async function ProductDetail({
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

  const isOwner = await getIsOwner(product.userId);
  const revalidate = async () => {
    "use server";
    revalidateTag("product-detail");
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
        <Link href={"/home"} className="text-white">
          <ArrowLeftCircleIcon className="z-50 absolute top-2 left-2 size-7" />
        </Link>
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
      <form action={revalidate} className="pl-4">
        <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
          Revalidate title cache
        </button>
      </form>
      <div className="fixed w-full bottom-0 p-5 pb-10 bg-neutral-800 flex justify-between items-center max-w-screen-sm">
        <span className="font-semibold text-xl">
          {formatToWon(product.price)}원
        </span>
        {isOwner ? (
          <form action={onDeleteProduct} className="pl-4">
            <button className="bg-red-500 px-5 py-2.5 rounded-md text-white font-semibold">
              Delete product
            </button>
          </form>
        ) : null}
        <div className="flex gap-2">
          <Link
            className="bg-orange-300 px-5 py-2.5 rounded-md text-white font-semibold"
            href={`/product/modify/${product.id}`}
          >
            수정하기
          </Link>
          <ChatForm productUserId={product.userId} />
        </div>
      </div>
    </div>
  );
}

export async function generateStaticParams() {
  const products = await db.product.findMany({
    select: {
      id: true,
    },
  });
  return products.map((product) => ({ id: product.id + "" }));
}
