"use client";

import { CourseDifficulty } from "@/app/utils/course";
import { CourseLanguages } from "@/app/utils/course";
import React, { useRef, useState, useTransition } from "react";
import classNames from "classnames";
import { usePersistentStore } from "@/stores/store";
import DifficultyBadge from "../DifficultyBadge/DifficultyBadge";
import { motion } from "motion/react";
import HeadingReveal from "../HeadingReveal/HeadingReveal";
import { useRouter } from "next/navigation";
import { useDirectionalHover } from "@/app/hooks/useDirectionalHover";

type CourseCardProps = {
  name: string;
  color: string;
  points?: number;
  language: CourseLanguages;
  difficulty?: CourseDifficulty;
  footer?: React.ReactNode;
  className?: string;
  link?: string;
};

export default function CourseCard({
  name,
  color,
  language,
  difficulty,
  footer,
  className,
  link,
}: CourseCardProps) {
  const { view } = usePersistentStore();
  const cardRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState(false);

  const {
    transform,
    isHovered,
    direction,
    swooshAngle,
    handleMouseEnter,
    handleMouseLeave,
  } = useDirectionalHover(cardRef);

  return (
    <div
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => {
        if (!link || isPending) return;
        setIsLoading(true);
        startTransition(() => {
          router.push(link);
        });
      }}
      style={{
        "--courseColor": color,
        "--swoosh-angle": `${swooshAngle}deg`,
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        willChange: "opacity",
      } as React.CSSProperties}
      className={classNames(
        "gradient-border flex overflow-hidden rounded-2xl pb-8 px-5 relative [background:linear-gradient(180deg,rgb(var(--courseColor),0.03),transparent_75%),linear-gradient(180deg,var(--color-background-card),var(--color-background-card))] before:[background:linear-gradient(180deg,rgba(var(--courseColor),0.1),rgba(var(--courseColor),0.05))]",
        view === "grid" && "pt-5 animate-card-swoosh",
        view === "list" && "pt-5 !pb-5",
        "transition-transform duration-300 cursor-pointer",
        isHovered && `swoosh-${direction}`,
        isLoading && "animate-pulse duration-1000 cursor-progress",
        className
      )}
    >
      {view === "grid" && difficulty && (
        <div className="absolute top-6 right-5">
          <DifficultyBadge difficulty={difficulty} />
        </div>
      )}
      <div
        className={classNames(
          "flex",
          view === "grid" && "flex-col gap-y-24 flex-grow justify-between",
          view === "list" && "flex-row justify-between w-full"
        )}
      >
        <div
          className={classNames(
            "flex",
            view === "grid" && "flex-col gap-y-6 items-start",
            view === "list" && "flex items-center gap-x-4"
          )}
        >
          <img
            src={`/graphics/${language.toLowerCase()}-course.svg`}
            className="h-16 -ml-1.5 [filter:drop-shadow(0_6px_4px_rgba(0,0,0,0.25))]"
            alt="course graphic"
          />
          <div className="flex flex-col gap-y-2.5">
            <div className="flex items-center gap-x-3">
              <HeadingReveal
                headingLevel="h3"
                text={language}
                className="font-mono font-medium leading-none tracking-normal"
                color={`rgb(${color})`}
                cursorColor={`rgb(${color})`}
                splitBy="chars"
                baseDelay={0.2}
              />
              {view === "list" && difficulty && (
                <DifficultyBadge
                  difficulty={difficulty}
                  className="relative bottom-[2px]"
                />
              )}
            </div>
            <div className="text-xl font-medium text-primary leading-[120%]">
              {name}
            </div>
          </div>
        </div>
        {footer && footer}
      </div>
    </div>
  );
}