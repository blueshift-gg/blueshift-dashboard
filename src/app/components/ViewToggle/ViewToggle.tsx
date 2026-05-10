"use client";

import { Icon } from "@blueshift-gg/ui-components";
import classNames from "classnames";
import { anticipate, motion } from "motion/react";
import { usePersistentStore } from "@/stores/store";

type ViewToggleProps = {
  className?: string;
  layoutName: string;
};

export default function ViewToggle({ className, layoutName }: ViewToggleProps) {
  const { view, setView } = usePersistentStore();
  return (
    <div
      className={classNames(
        "hidden md:flex w-max items-center gap-x-2  bg-card-solid p-1 relative",
        className,
      )}
    >
      <button
        type="button"
        className="relative cursor-pointer p-3 text-shade-tertiary transition hover:!text-shade-primary"
        onClick={() => setView("grid")}
      >
        <Icon
          name="GridView"
          className={classNames("", {
            "!text-brand-secondary": view === "grid",
          })}
        />
        {view === "grid" && (
          <motion.div
            className="absolute top-0 left-0 h-[42px] w-[42px] bg-brand-primary/5"
            layoutId={`${layoutName}`}
            transition={{ duration: 0.4, ease: anticipate }}
          />
        )}
      </button>
      <button
        type="button"
        className="relative cursor-pointer p-3 text-shade-tertiary transition hover:!text-shade-primary"
        onClick={() => setView("list")}
      >
        <Icon
          name="ListView"
          className={classNames("", {
            "!text-brand-secondary": view === "list",
          })}
        />
        {view === "list" && (
          <motion.div
            className="absolute top-0 left-0 h-[42px] w-[42px] bg-brand-primary/5"
            layoutId={`${layoutName}`}
            transition={{ duration: 0.4, ease: anticipate }}
          />
        )}
      </button>
    </div>
  );
}
