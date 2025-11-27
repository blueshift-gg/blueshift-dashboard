"use client";

import classNames from "classnames";

export default function PathCardSkeleton() {
  return (
    <div
      className={classNames(
        "transform-gpu group transition-transform duration-300 flex flex-col overflow-hidden p-1 relative bg-card-solid border-border-light border animate-pulse"
      )}
    >
      <div className="w-full bg-background/50 aspect-2/1"></div>
      <div
        className={classNames(
          "flex flex-col gap-y-8 flex-grow justify-between px-4 py-5"
        )}
      >
        {/* TODO: put actual skeleton here */}
      </div>
    </div>
  );
}
