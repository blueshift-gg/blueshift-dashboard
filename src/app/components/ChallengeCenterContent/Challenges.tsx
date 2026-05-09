import { Suspense } from "react";
import { getAllChallenges } from "@/app/utils/content";
import ChallengesList from "./ChallengesList";

async function ChallengesContent() {
  const challenges = await getAllChallenges();

  return <ChallengesList initialChallenges={challenges} />;
}

export default function Challenges() {
  return (
    <div className="content-wrapper relative">
      <Suspense fallback={<ChallengesList isLoading={true} />}>
        <ChallengesContent />
      </Suspense>
    </div>
  );
}
