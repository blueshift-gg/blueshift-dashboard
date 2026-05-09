"use client";

import classNames from "classnames";

export default function PathCardSkeleton() {
  return (
    <div
      className={classNames(
        "transform-gpu group transition-transform duration-300 flex flex-col overflow-hidden p-1 relative bg-card-solid border-border-light border animate-pulse",
      )}
    >
      <div
        className={classNames("flex flex-col gap-y-24 flex-grow justify-between px-4 py-5 pb-6")}
      >
        <div className="flex flex-col gap-y-5">
          <div className="h-12 w-12 bg-card-foreground"></div>
          <div className="flex flex-col gap-y-2">
            <div className="h-[28px] w-[200px] bg-card-foreground"></div>
            <div className="h-[52px] w-full bg-card-foreground"></div>
          </div>
        </div>
        <div className="flex w-full flex-col gap-y-5">
          <div className="h-[28px] w-full bg-card-foreground"></div>
          <div className="h-[48px] w-full bg-card-foreground"></div>
        </div>
      </div>
    </div>
  );
}
