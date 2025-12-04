"use client";

import { anticipate, motion } from "motion/react";
import classNames from "classnames";
import { Icon } from "@blueshift-gg/ui-components";
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
        className
      )}
    >
      <button
        className="p-3 relative cursor-pointer text-shade-tertiary hover:!text-shade-primary transition"
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
            className="absolute left-0 top-0 h-[42px] w-[42px] bg-brand-primary/5"
            layoutId={`${layoutName}`}
            transition={{ duration: 0.4, ease: anticipate }}
          />
        )}
      </button>
      <button
        className="p-3 relative cursor-pointer text-shade-tertiary hover:!text-shade-primary transition"
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
            className="absolute left-0 top-0 h-[42px] w-[42px] bg-brand-primary/5"
            layoutId={`${layoutName}`}
            transition={{ duration: 0.4, ease: anticipate }}
          />
        )}
      </button>
    </div>
  );
}
