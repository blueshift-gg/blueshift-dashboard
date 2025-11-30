import classNames from "classnames";

export default function ChallengeCardSkeleton() {
  return (
    <div
      className={classNames(
        "shrink-0 w-full snap-center max-w-[360px] aspect-3/4 transform-gpu group transition-transform justify-end animate-card-swoosh duration-300 flex flex-col overflow-hidden p-1 bg-card-solid relative border-border-light border"
      )}
    >
      <div className={classNames("flex flex-col gap-y-6 px-4 py-5")}>
        <div className="flex flex-col gap-y-2 min-h-[90px]">
          <div className="bg-card-foreground w-[180px] h-[24px]"></div>
          <div className="bg-card-foreground w-[200px] h-[28px]"></div>
        </div>

        <div className="relative z-20 flex flex-col gap-y-4">
          <div className="bg-card-foreground w-full h-[42px]"></div>
          <div className="bg-card-foreground w-[100px] h-[14px] mx-auto"></div>
        </div>
      </div>
    </div>
  );
}
