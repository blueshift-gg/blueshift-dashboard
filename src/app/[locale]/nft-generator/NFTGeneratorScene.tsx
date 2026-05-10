"use client";

import NFTScene from "@/app/components/NFTViewer/NFTScene";

export default function NFTGeneratorScene() {
  return (
    <div className="h-screen w-screen">
      <NFTScene
        challengeName="Hello World"
        challengeLanguage="Typescript"
        challengeDifficulty={1}
        isAnimationComplete={true}
        useAnimation={false}
        showControls={true}
        showBackground={true}
      />
    </div>
  );
}
