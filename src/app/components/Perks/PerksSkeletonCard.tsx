export default function PerksSkeletonCard() {
  return (
    <div className="flex w-full animate-pulse flex-col gap-y-7 border border-border-light bg-card-solid p-px text-shade-tertiary">
      <div className="flex items-center gap-x-5 px-5 py-6">
        <div className="h-[56px] w-[64px] bg-card-foreground"></div>
        <div className="flex flex-col gap-y-1.5">
          <div className="h-[22px] w-[100px] bg-card-foreground"></div>
          <div className="h-[24px] w-[250px] bg-card-foreground md:h-[28px]"></div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-background/40 p-3">
        <div className="h-[40px] w-full bg-card-foreground md:h-[48px]"></div>
      </div>
    </div>
  );
}
