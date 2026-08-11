import type { Metadata } from "next";
import { AnomaliesBoard } from "@/components/anomalies/AnomaliesBoard";

export const metadata: Metadata = {
  title: "Anomalies — The Animals",
  description: "Drag-and-fuse insight board: topic circles, fused ideas, and the ideas panel.",
};

export default function AnomaliesPage() {
  return <AnomaliesBoard />;
}
