"use client";

import { BRAND_COLOURS, CrosshairCorners, HeadingReveal } from "@blueshift-gg/ui-components";
import classNames from "classnames";
import { useTranslations } from "next-intl";
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
  const _t = useTranslations();
  const color = badgeColor
    ? BRAND_COLOURS[badgeColor.toLowerCase() as keyof typeof BRAND_COLOURS]
    : undefined;

  return (
    <div
      className={classNames(
        "max-w-app mx-auto w-full relative",
        showBorder && "border-x border-border-light",
        className,
      )}
    >
      <div className="absolute bottom-0 left-1/2 h-px w-dvw -translate-x-1/2 bg-border-light"></div>
      <div className="flex flex-col gap-y-2 px-6 py-8 lg:px-12 lg:py-12">
        <div className="relative w-max px-1.5 py-0.5" style={{ color }}>
          <span className="font-mono text-lg leading-none font-medium">{badge}</span>
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
          className="text-[28px] leading-[120%] font-semibold sm:text-3xl"
        />
        {collectionMintAddress && typeof collectionSize === "number" && (
          <Link
            href={`https://solana.fm/address/${collectionMintAddress}`}
            target="_blank"
            className="pt-2"
          >
            <p
              className="font-mono text-sm text-shade-secondary"
              style={{
                color: color,
              }}
            >
              {collectionSize.toString()} {collectionSize === 1 ? "Graduate" : "Graduates"}
            </p>
          </Link>
        )}
      </div>
    </div>
  );
}
