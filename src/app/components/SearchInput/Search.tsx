"use client";

import classNames from "classnames";
import { Icon } from "@blueshift-gg/ui-components";
import { useTranslations } from "next-intl";
import { useStore } from "@/stores/store";

interface SearchInputProps {
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function SearchInput({
  disabled,
  onKeyDown,
  className,
}: SearchInputProps) {
  const t = useTranslations();
  const { searchValue, setSearchValue } = useStore();
  return (
    <div
      className={classNames(
        "w-full group focus-within:outline transition outline-transparent focus-within:outline-border-active relative h-[50px] px-3 bg-card border border-border bg-card-solid flex items-center gap-x-3",
        className
      )}
    >
      <Icon
        name="Search"
        className="text-mute group-focus-within:text-shade-tertiary transition flex-shrink-0 w-max"
      />
      <input
        disabled={disabled}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={onKeyDown}
        type="text"
        placeholder={t("ui.search_placeholder")}
        className="w-full placeholder:text-mute transition leading-none h-full outline-none bg-transparent"
      />
    </div>
  );
}
