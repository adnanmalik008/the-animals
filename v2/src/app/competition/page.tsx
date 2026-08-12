import { CompetitionBoard } from "@/components/competition/CompetitionBoard";
import { requireBoardAccess } from "@/lib/server/guard";

export default async function CompetitionPage() {
  await requireBoardAccess("/competition");
  return <CompetitionBoard />;
}
