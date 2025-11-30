"use client";

import {
  CrosshairCorners,
  HeadingReveal,
  BRAND_COLOURS,
} from "@blueshift-gg/ui-components";
import { useTranslations } from "next-intl";
import classNames from "classnames";
import { Link } from "@/i18n/navigation";

export default function PageHero({
  badge,
  title,
  badgeColor,
  className,
  collectionSize,
  collectionMintAddress,
  showBorder = true,
}: {
  badge: string;
  title: string;
  badgeColor?: string;
  className?: string;
  collectionSize?: number | null;
  collectionMintAddress?: string;
  showBorder?: boolean;
}) {
  const t = useTranslations();
  const color = badgeColor
    ? BRAND_COLOURS[badgeColor.toLowerCase() as keyof typeof BRAND_COLOURS]
    : undefined;

  return (
    <div
      className={classNames(
        "max-w-app mx-auto w-full relative",
        showBorder && "border-x border-border-light",
        className
      )}
    >
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-dvw h-px bg-border-light"></div>
      <div className="flex flex-col gap-y-2 px-6 py-8 md:py-12 md:px-12">
        <div className="relative w-max py-0.5 px-1.5" style={{ color }}>
          <span className="font-medium text-lg leading-none font-mono">
            {badge}
          </span>
          <CrosshairCorners
            size={4}
            spacingY={0}
            spacingX={0}
            className="text-current"
            animationDelay={0}
            animationDuration={0.5}
          />
        </div>
        <span className="sr-only">{title}</span>
        <HeadingReveal
          text={title}
          headingLevel="h1"
          className="text-[28px] leading-[120%] sm:text-3xl font-semibold"
        />
        {collectionMintAddress && typeof collectionSize === "number" && (
          <Link
            href={`https://solana.fm/address/${collectionMintAddress}`}
            target="_blank"
            className="pt-2"
          >
            <p
              className="text-shade-secondary text-sm font-mono"
              style={{
                color: color,
              }}
            >
              {collectionSize.toString()}{" "}
              {collectionSize === 1 ? "Graduate" : "Graduates"}
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
