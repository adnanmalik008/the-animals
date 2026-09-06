import { LiveBoard } from "@/components/live/LiveBoard";
import { requireBoardAccess } from "@/lib/server/guard";

export default async function LivePage() {
  await requireBoardAccess("/");
  return <LiveBoard />;
}
