"use client";

import { fetchFromAPI } from "@/app/extras/[[...potato]]/action";

export default function HackedComponent({ data }: any) {
  fetchFromAPI();
  return <h1>heacked</h1>;
}
