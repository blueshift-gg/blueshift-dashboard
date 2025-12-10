"use client";

import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { Icon } from "@blueshift-gg/ui-components";
import { PaginationButton } from "@blueshift-gg/ui-components/Pagination";
import classNames from "classnames";
import { usePathContent } from "@/app/hooks/usePathContent";
import { useTranslations } from "next-intl";
import type { PathNavigationStep } from "@/app/contexts/PathContentContext";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  children?: React.ReactNode;
  hasPagination?: boolean;
  onPaginate?: (direction: "previous" | "next") => void;
  canPaginateBack?: boolean;
  canPaginateForward?: boolean;
}

const scopedLabels = ["header.courses", "header.challenges"] as const;

function buildPathHref(step: PathNavigationStep, pathSlug: string) {
  if (step.type === "course") {
    if (!step.slug) return null;
    if (step.defaultLessonSlug) {
      return `/paths/${pathSlug}/courses/${step.slug}/${step.defaultLessonSlug}`;
    }
    return `/paths/${pathSlug}/courses/${step.slug}`;
  }

  if (step.type === "challenge") {
    return `/paths/${pathSlug}/challenges/${step.slug}`;
  }

  return null;
}

function deriveBreadcrumbItems(
  items: BreadcrumbItem[],
  pathSlug: string | null,
  t: ReturnType<typeof useTranslations>
) {
  if (!pathSlug) return items;

  const scopedTexts = scopedLabels.map((key) => t(key));
  const sanitizedItems = items.filter(
    (item) =>
      !scopedTexts.includes(item.label) &&
      item.href !== "/courses" &&
      item.href !== "/challenges"
  );

  let pathTitle = pathSlug;
  try {
    pathTitle = t(`paths.${pathSlug}.title`);
  } catch {
    pathTitle = pathSlug
      .split("-")
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");
  }

  const pathsLabel = t("header.paths");
  const pathItems: BreadcrumbItem[] = [
    { label: pathsLabel, href: "/paths" },
    { label: pathTitle, href: `/paths/${pathSlug}` },
  ];

  const alreadyScoped = sanitizedItems.some(
    (item) =>
      item.label === pathsLabel ||
      item.href === "/paths" ||
      item.href?.startsWith(`/paths/${pathSlug}`) ||
      item.label === pathTitle
  );

  return alreadyScoped ? sanitizedItems : [...pathItems, ...sanitizedItems];
}

function derivePathPagination(
  pathname: string,
  pathSlug: string | null,
  pathSteps: PathNavigationStep[] | undefined
) {
  if (!pathSlug || !pathSteps?.length) return null;

  const indexByKey: Record<string, number> = {};
  pathSteps.forEach((step, idx) => {
    if (step.slug) {
      indexByKey[`${step.type}:${step.slug}`] = idx;
    }
  });

  const segments = pathname.split("/").filter(Boolean);
  const pathIndex = segments.indexOf(pathSlug);
  if (pathIndex === -1) return null;

  const resourceTypeSegment = segments[pathIndex + 1];
  const resourceSlug = segments[pathIndex + 2];

  const resourceType =
    resourceTypeSegment === "courses"
      ? "course"
      : resourceTypeSegment === "challenges"
        ? "challenge"
        : null;

  if (!resourceType || !resourceSlug) return null;

  const currentIndex = indexByKey[`${resourceType}:${resourceSlug}`] ?? -1;
  if (currentIndex === -1) return null;

  const previousStep = pathSteps[currentIndex - 1];
  const nextStep = pathSteps[currentIndex + 1];

  const previousHref = previousStep ? buildPathHref(previousStep, pathSlug) : null;
  const nextHref = nextStep ? buildPathHref(nextStep, pathSlug) : null;

  if (!previousHref && !nextHref) return null;

  return {
    previousHref: previousHref ?? undefined,
    nextHref: nextHref ?? undefined,
  } as const;
}

export default function Breadcrumbs({
  items,
  className,
  children,
  hasPagination = false,
  onPaginate,
  canPaginateBack = true,
  canPaginateForward = true,
}: BreadcrumbsProps) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const { pathSlug, steps: pathSteps } = usePathContent();

  const resolvedPathSlug = pathSlug ?? null;

  const breadcrumbItems = deriveBreadcrumbItems(items, resolvedPathSlug, t);
  const pathPagination = derivePathPagination(pathname, resolvedPathSlug, pathSteps);

  const shouldShowPagination = hasPagination || Boolean(pathPagination);
  const resolvedCanPaginateBack = hasPagination
    ? canPaginateBack
    : Boolean(pathPagination?.previousHref);
  const resolvedCanPaginateForward = hasPagination
    ? canPaginateForward
    : Boolean(pathPagination?.nextHref);

  const handlePaginate = (direction: "previous" | "next") => {
    if (onPaginate) {
      onPaginate(direction);
      return;
    }

    if (!pathPagination) {
      return;
    }

    const target =
      direction === "previous"
        ? pathPagination.previousHref
        : pathPagination.nextHref;

    if (target) {
      router.push(target);
    }
  };

  return (
    <nav
      className={classNames(
        "max-w-app relative mx-auto w-full px-5 py-3 flex items-center gap-2 text-sm font-medium text-shade-tertiary",
        className
      )}
    >
      <div className="absolute inset-0 -z-1 w-dvw border-b border-border-light bg-card-solid"></div>
      <div className="relative z-10 flex items-center gap-2 flex-1 min-w-0">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          return (
            <div
              key={item.href ?? item.label}
              className="flex items-center gap-2"
            >
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="hover:text-shade-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={classNames(isLast && "text-shade-primary")}>
                  {item.label}
                </span>
              )}
              {!isLast && (
                <Icon
                  name="Chevron"
                  size={12}
                  className="-rotate-90 text-shade-mute"
                />
              )}
            </div>
          );
        })}
        {children}
      </div>
      {shouldShowPagination && (
        <div className="relative z-10 ml-auto flex items-center gap-x-2 flex-shrink-0 [&_button:not(:disabled)]:cursor-pointer">
          <PaginationButton
            label="Previous"
            onClick={() => handlePaginate("previous")}
            disabled={!resolvedCanPaginateBack}
            isControl
            controlDirection="left"
          />
          <PaginationButton
            label="Next"
            onClick={() => handlePaginate("next")}
            disabled={!resolvedCanPaginateForward}
            isControl
            controlDirection="right"
          />
        </div>
      )}
    </nav>
  );
}
