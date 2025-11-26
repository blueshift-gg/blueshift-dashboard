import { getAllChallenges } from "@/app/utils/content";
import ChallengesList from "./ChallengesList";
import { Suspense } from "react";

async function ChallengesContent() {
  const challenges = await getAllChallenges();

  return <ChallengesList initialChallenges={challenges} />;
}

export default function Challenges() {
  return (
    <div className="relative content-wrapper">
      <Suspense fallback={<ChallengesList isLoading={true} />}>
        <ChallengesContent />
      </Suspense>
    </div>
  );
}
