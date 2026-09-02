import type { Metadata } from "next";

import { AdminGate } from "@/components/admin-gate";

export const metadata: Metadata = {
  title: "التهاني",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <AdminGate />;
}
