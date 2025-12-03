import classNames from "classnames";

export default function CourseCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden p-1 relative bg-card-solid border-border-light border">
      <div className="w-full bg-background/50 aspect-2/1 h-full max-h-[200px] group-hover/card:scale-[0.99] transition-all duration-100 ease-glide"></div>
      <div
        className={classNames(
          "flex flex-col gap-y-8 flex-grow justify-between px-4 py-5"
        )}
      >
        <div className="flex flex-col gap-y-2 min-h-[125px] sm:min-h-[100px]">
          <div className="bg-card-foreground w-[100px] h-[24px]"></div>
          <div className="bg-card-foreground w-[250px] h-[28px]"></div>
        </div>
        <div className="bg-card-foreground w-[150px] h-[48px]"></div>
      </div>
    </div>
  );
}
