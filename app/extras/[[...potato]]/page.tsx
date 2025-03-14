import HackedComponent from "@/components/hacked-component";
import { revalidatePath } from "next/cache";
import {
  experimental_taintObjectReference,
  experimental_taintUniqueValue,
} from "react";

async function getData() {
  const keys = {
    apiKey: "1119191",
    secret: "1011101231,",
  };

  // experimental_taintObjectReference("ApIKeys were leaded!!!", keys);
  experimental_taintUniqueValue("Secret key was exposed", keys, keys.secret);
  return keys;
}

export default async function Extras({
  params,
}: {
  params: { potato: string[] };
}) {
  const data = await getData();

  return (
    <div className="flex flex-col gap-3 py-10">
      <h1 className="text-6xl font-metallica">metallica!</h1>
      <h1 className="text-6xl font-rubick">Rubick!</h1>
      <h2 className="font-roboto">So much more to learn!</h2>
      <HackedComponent data={data} />
    </div>
  );
}
