"use client";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

import classNames from "classnames";
import Icon from "../Icon/Icon";
import { AnimatePresence, anticipate, motion } from "motion/react";
import { useOnClickOutside } from "usehooks-ts";
import { courseLanguages, CourseLanguages } from "@/app/utils/course";
import Checkbox from "../Checkbox/Checkbox";
import { IconName } from "../Icon/icons";
import { usePersistentStore } from "@/stores/store";
import Divider from "../Divider/Divider";

interface FiltersProps {
  className?: string;
}

export default function CourseFilter({ className }: FiltersProps) {
  const t = useTranslations();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLElement>(null) as React.RefObject<HTMLElement>;
  const { selectedLanguages, toggleLanguage } = usePersistentStore();

  const allLanguages = Object.keys(courseLanguages) as CourseLanguages[];
  const displayText =
    selectedLanguages.length === allLanguages.length
      ? t("ui.search_language_filter__label")
      : selectedLanguages.length === 1
        ? selectedLanguages[0]
        : `${selectedLanguages.length} ${t("ui.search_language_filter__selected_languages")}`;

  const toggleAllLanguages = () => {
    if (selectedLanguages.length === allLanguages.length) {
      // If all are selected, deselect all
      allLanguages.forEach((lang) => {
        if (selectedLanguages.includes(lang)) {
          toggleLanguage(lang);
        }
      });
    } else {
      // If not all are selected, select all
      allLanguages.forEach((lang) => {
        if (!selectedLanguages.includes(lang)) {
          toggleLanguage(lang);
        }
      });
    }
  };

  const handleLanguageClick = (language: CourseLanguages) => {
    if (selectedLanguages.length === allLanguages.length) {
      // If "All" is selected, deselect all and select only the clicked language
      allLanguages.forEach((lang) => {
        if (selectedLanguages.includes(lang)) {
          toggleLanguage(lang);
        }
      });
      toggleLanguage(language);
    } else {
      // Normal toggle behavior
      toggleLanguage(language);
    }
  };

  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  return (
    <div
      className="relative"
      ref={dropdownRef as React.RefObject<HTMLDivElement>}
    >
      <button
        onMouseDown={() => setIsOpen(!isOpen)}
        className={classNames(
          "cursor-pointer w-[160px] gap-x-4 pl-3 pr-4 py-3 transition outline-transparent focus-within:outline-border-active relative h-[50px] bg-card border hover:border-border-active border-border bg-card-solid rounded-xl flex items-center justify-start",
          className
        )}
      >
        <Icon name="Filter" className="text-shade-tertiary" />
        <span className="text-shade-tertiary text-sm font-medium">
          {displayText}
        </span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.4, ease: anticipate }}
            className={classNames(
              "border border-border z-50 min-w-[200px] rounded-xl flex w-max flex-col gap-y-1 absolute top-[calc(100%+6px)] p-1 bg-card-solid",
              className
            )}
          >
            <button
              onClick={toggleAllLanguages}
              className="flex items-center gap-x-4 py-3 px-2.5 pr-4 rounded-lg transition hover:bg-card-solid-foreground"
            >
              <Checkbox
                checked={selectedLanguages.length === allLanguages.length}
              />
              <span className="text-sm font-medium leading-none text-shade-secondary">
                {t("ui.search_language_filter__all_languages")}
              </span>
            </button>
            <Divider />
            <div className={classNames("flex relative flex-col gap-y-1")}>
              {/* <AnimatePresence>
                {selectedLanguages.length === allLanguages.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1, ease: anticipate }}
                    className={classNames(
                      "absolute top-0 left-0 w-full h-full bg-card-solid-foreground rounded-lg"
                    )}
                  />
                )}
              </AnimatePresence> */}
              {allLanguages.map((language) => (
                <button
                  key={language}
                  onClick={() => handleLanguageClick(language)}
                  className={classNames(
                    "flex items-center relative gap-x-4 py-3 px-2.5 pr-4 rounded-lg transition hover:bg-card-solid-foreground",
                    selectedLanguages.includes(language) &&
                      "bg-card-solid-foreground",
                    selectedLanguages.includes(language) &&
                      "hover:!bg-card-solid-foreground/50"
                  )}
                >
                  {/* <Checkbox
                    theme="secondary"
                    className="z-10 relative"
                    checked={selectedLanguages.includes(language)}
                  /> */}
                  <div className="flex items-center gap-x-2 relative z-10 text-brand-primary">
                    <Icon name={language as IconName} />
                    <span
                      className={classNames(
                        "text-sm font-medium leading-none text-shade-secondary",
                        selectedLanguages.includes(language) &&
                          "!text-shade-primary"
                      )}
                    >
                      {courseLanguages[language]}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
