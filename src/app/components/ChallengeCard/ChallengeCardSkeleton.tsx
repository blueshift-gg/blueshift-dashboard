import classNames from "classnames";

export default function ChallengeCardSkeleton() {
  return (
    <div
      className={classNames(
        "shrink-0 w-full snap-center max-w-[360px] aspect-3/4 transform-gpu group transition-transform justify-end animate-card-swoosh duration-300 flex flex-col overflow-hidden p-1 bg-card-solid relative border-border-light border",
      )}
    >
      <div className={classNames("flex flex-col gap-y-6 px-4 py-5")}>
        <div className="flex min-h-[90px] flex-col gap-y-2">
          <div className="h-[24px] w-[180px] bg-card-foreground"></div>
          <div className="h-[28px] w-[200px] bg-card-foreground"></div>
        </div>

        <div className="relative z-20 flex flex-col gap-y-4">
          <div className="h-[42px] w-full bg-card-foreground"></div>
          <div className="mx-auto h-[14px] w-[100px] bg-card-foreground"></div>
        </div>
      </div>
    </div>
  );
}
