"use client";

import { Icon } from "@blueshift-gg/ui-components";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { useStore } from "@/stores/store";

interface SearchInputProps {
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function SearchInput({ disabled, onKeyDown, className }: SearchInputProps) {
  const t = useTranslations();
  const { searchValue, setSearchValue } = useStore();
  return (
    <div
      className={classNames(
        "w-full group focus-within:outline transition outline-transparent focus-within:outline-border-active relative h-[50px] px-3 bg-card border border-border bg-card-solid flex items-center gap-x-3",
        className,
      )}
    >
      <Icon
        name="Search"
        className="text-mute w-max flex-shrink-0 transition group-focus-within:text-shade-tertiary"
      />
      <input
        disabled={disabled}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={onKeyDown}
        type="text"
        placeholder={t("ui.search_placeholder")}
        className="placeholder:text-mute h-full w-full bg-transparent leading-none transition outline-none"
      />
    </div>
  );
}
