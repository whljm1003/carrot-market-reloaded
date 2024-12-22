import CloseButton from "./CloseButton";
import db from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";
import { UserIcon } from "@heroicons/react/24/solid";
import { formatToWon } from "@/lib/utils";

const getProduct = (id: number) => {
  const product = db.product.findUnique({
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
};

export default async function Modal({ params }: { params: { id: string } }) {
  // params를 await로 처리
  const { id } = await params;
  const productId = Number(id);

  if (isNaN(productId)) {
    return notFound();
  }

  const product = await getProduct(productId);
  if (!product) {
    return notFound();
  }

  return (
    <div className="absolute w-full h-full z-50 flex items-center justify-center bg-black bg-opacity-60 left-0 top-0">
      <CloseButton />
      <div className="max-w-screen-sm h-1/2 flex justify-center w-full bg-neutral-700 rounded-md overflow-hidden">
        <div className="relative aspect-square text-neutral-200 overflow-hidden flex-col sm:flex-row flex justify-center items-center gap-5 ">
          <Image
            fill
            className="object-cover"
            src={product.photo}
            // src={`${product.photo}/width=500,height=500`}
            alt={product.title}
          />
        </div>
        <div className="flex flex-col items-center justify-between">
          <div>
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
          </div>
          <div className="p-5">
            <span className="font-semibold text-xl">
              {formatToWon(product.price)}원
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
