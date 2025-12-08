export default function PerksSkeletonCard() {
  return (
    <div className="flex flex-col gap-y-7 text-shade-tertiary p-px border border-border-light w-full bg-card-solid animate-pulse">
      <div className="flex items-center gap-x-5 px-5 py-6">
        <div className="w-[64px] h-[56px] bg-card-foreground"></div>
        <div className="flex flex-col gap-y-1.5">
          <div className="w-[100px] h-[22px] bg-card-foreground"></div>
          <div className="w-[250px] md:h-[28px] h-[24px] bg-card-foreground"></div>
        </div>
      </div>

      <div className="bg-background/40 p-3 w-full flex items-center justify-center">
        <div className="w-full md:h-[48px] h-[40px] bg-card-foreground"></div>
      </div>
    </div>
  );
}
