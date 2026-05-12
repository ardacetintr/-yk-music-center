import type { Metadata } from "next";
import LiquidAtrium from "./LiquidAtrium";

export const metadata: Metadata = {
  description: "Öykü Music Center — canlı dalga ekranı"
};

export default function LiquidPage() {
  return <LiquidAtrium />;
}
