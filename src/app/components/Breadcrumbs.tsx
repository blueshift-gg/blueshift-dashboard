"use client";

import { Link } from "@/i18n/navigation";
import { Icon } from "@blueshift-gg/ui-components";
import { PaginationButton } from "@blueshift-gg/ui-components/Pagination";
import classNames from "classnames";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  children?: React.ReactNode;
  hasPagination?: boolean;
}

export default function Breadcrumbs({
  items,
  className,
  children,
  hasPagination = false,
}: BreadcrumbsProps) {
  return (
    <nav
      className={classNames(
        "max-w-app relative mx-auto w-full pl-5 pr-2.5 relative py-3 flex items-center gap-2 text-sm font-medium text-shade-tertiary",
        className
      )}
    >
      <div className="absolute -z-1 bottom-0 left-1/2 -translate-x-1/2 w-dvw h-[44px] border-b border-border-light bg-card-solid"></div>
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center gap-2 relative z-10">
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
            {children}
          </div>
        );
      })}
      {hasPagination && (
        <div className="absolute top-1/2 -translate-y-1/2 right-1 flex items-center gap-x-1">
          <PaginationButton
            label="Previous"
            onClick={() => {}}
            disabled={false}
            isControl
            controlDirection="left"
          />
          <PaginationButton
            label="Next"
            onClick={() => {}}
            disabled={false}
            isControl
            controlDirection="right"
          />
        </div>
      )}
    </nav>
  );
}
