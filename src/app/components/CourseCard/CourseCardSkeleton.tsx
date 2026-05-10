import classNames from "classnames";

export default function CourseCardSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden border border-border-light bg-card-solid p-1">
      <div className="aspect-2/1 h-full max-h-[200px] w-full bg-background/50 transition-all duration-100 ease-glide group-hover/card:scale-[0.99]"></div>
      <div className={classNames("flex flex-col gap-y-8 flex-grow justify-between px-4 py-5")}>
        <div className="flex min-h-[125px] flex-col gap-y-2 sm:min-h-[100px]">
          <div className="h-[24px] w-[100px] bg-card-foreground"></div>
          <div className="h-[28px] w-[250px] bg-card-foreground"></div>
        </div>
        <div className="h-[48px] w-[150px] bg-card-foreground"></div>
      </div>
    </div>
  );
}
