"use client";

import classNames from "classnames";

export default function PathCardSkeleton() {
  return (
    <div
      className={classNames(
        "transform-gpu group transition-transform duration-300 flex flex-col overflow-hidden p-1 relative bg-card-solid border-border-light border animate-pulse"
      )}
    >
      <div
        className={classNames(
          "flex flex-col gap-y-24 flex-grow justify-between px-4 py-5 pb-6"
        )}
      >
        <div className="flex flex-col gap-y-5">
          <div className="w-12 h-12 bg-card-foreground"></div>
          <div className="flex flex-col gap-y-2">
            <div className="w-[200px] h-[28px] bg-card-foreground"></div>
            <div className="w-full h-[52px] bg-card-foreground"></div>
          </div>
        </div>
        <div className="flex flex-col gap-y-5 w-full">
          <div className="w-full h-[28px] bg-card-foreground"></div>
          <div className="w-full h-[48px] bg-card-foreground"></div>
        </div>
      </div>
    </div>
  );
}
