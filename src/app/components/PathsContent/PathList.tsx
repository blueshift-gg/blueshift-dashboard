"use client";

import { PathMetadata, getPathCompletedSteps } from "@/app/utils/path";
import { CourseLanguages } from "@/app/utils/course";
import {
  languageFilterMap,
  reverseLanguageFilterMap,
  difficultyFilterMap,
  reverseDifficultyFilterMap,
} from "@/app/utils/common";
import { usePersistentStore } from "@/stores/store";
import PathCard from "../PathCard/PathCard";
import classNames from "classnames";
import { getPathDropdownItems } from "@/app/utils/dropdownItems";
import { useTranslations } from "next-intl";
import {
  Banner,
  Dropdown,
  Input,
  Icon,
  Tabs,
} from "@blueshift-gg/ui-components";
import { useStore } from "@/stores/store";
import { useWindowSize } from "usehooks-ts";
import { useEffect, useRef, useState } from "react";
import PathCardSkeleton from "../PathCard/PathCardSkeleton";

type PathsContentProps = {
  initialPaths?: PathMetadata[];
  isLoading?: boolean;
};

export default function PathList({
  initialPaths = [],
  isLoading = false,
}: PathsContentProps) {
  const t = useTranslations();
  const {
    selectedLanguages,
    toggleLanguage,
    setLanguages,
    selectedDifficulties,
    toggleDifficulty,
    setDifficulties,
    courseProgress,
    challengeStatuses,
  } = usePersistentStore();
  const { searchValue, setSearchValue } = useStore();
  const [activeTab, setActiveTab] = useState("all-paths");
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false);

  const [scrollState, setScrollState] = useState({
    isAtStart: true,
    isAtEnd: false,
  });

  const carouselRef = useRef<HTMLDivElement>(null);

  // Function to update scroll state
  const updateScrollState = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setScrollState({
        isAtStart: scrollLeft === 0,
        isAtEnd: scrollLeft === scrollWidth - clientWidth,
      });
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      updateScrollState();
      carousel.addEventListener("scroll", updateScrollState);
      return () => carousel.removeEventListener("scroll", updateScrollState);
    }
  }, []);

  useEffect(() => {
    setIsMobile(width < 768);
  }, [width]);

  const handleFilterChange = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
      const newLanguages: CourseLanguages[] = [];
      const newDifficulties: number[] = [];
      const statusOptions = ["in-progress", "completed"];
      const selectedStatuses: string[] = [];

      value.forEach((v) => {
        if (v in difficultyFilterMap) {
          newDifficulties.push(difficultyFilterMap[v]);
        } else if (v in languageFilterMap) {
          newLanguages.push(languageFilterMap[v]);
        } else if (statusOptions.includes(v)) {
          selectedStatuses.push(v);
        }
      });

      setLanguages(newLanguages);
      setDifficulties(newDifficulties);

      if (selectedStatuses.length > 1) {
        const newStatus = selectedStatuses.find((s) => s !== activeTab);
        setActiveTab(newStatus || "all-paths");
      } else if (selectedStatuses.length === 1) {
        setActiveTab(selectedStatuses[0]);
      } else {
        setActiveTab("all-paths");
      }
    } else if (typeof value === "string") {
      if (value in difficultyFilterMap) {
        toggleDifficulty(difficultyFilterMap[value]);
      } else if (value in languageFilterMap) {
        toggleLanguage(languageFilterMap[value]);
      } else if (["in-progress", "completed"].includes(value)) {
        setActiveTab(value === activeTab ? "all-paths" : value);
      }
    }
  };

  // Calculate global in-progress paths
  const globalInProgressPaths = initialPaths.filter((path) => {
    const completedSteps = getPathCompletedSteps(
      path.steps,
      courseProgress,
      challengeStatuses
    );
    const totalSteps = path.steps.length;
    return completedSteps > 0 && completedSteps < totalSteps;
  });

  const hasInProgress = globalInProgressPaths.length > 0;

  // Disable In Progress tab if no paths are in progress
  useEffect(() => {
    if (!hasInProgress && activeTab === "in-progress") {
      setActiveTab("all-paths");
    }
  }, [hasInProgress, activeTab]);

  // Filter paths
  const filteredPaths = initialPaths
    .filter((path) => {
      // 1. Search
      const matchesSearch = t(`paths.${path.slug}.title`)
        .toLowerCase()
        .includes((searchValue || "").toLowerCase());

      // 2. Language Filter (Empty = All)
      const matchesLanguage =
        selectedLanguages.length === 0 ||
        selectedLanguages.includes(path.language as CourseLanguages);

      // 3. Difficulty Filter (Empty = All)
      const matchesDifficulty =
        selectedDifficulties.length === 0 ||
        selectedDifficulties.includes(path.difficulty);

      // 4. Tab Filter
      let matchesTab = true;
      const completedSteps = getPathCompletedSteps(
        path.steps,
        courseProgress,
        challengeStatuses
      );
      const totalSteps = path.steps.length;

      if (activeTab === "in-progress") {
        matchesTab = completedSteps > 0 && completedSteps < totalSteps;
      } else if (activeTab === "completed") {
        matchesTab = completedSteps === totalSteps;
      }

      return (
        matchesSearch && matchesLanguage && matchesDifficulty && matchesTab
      );
    })
    .sort((a, b) => a.difficulty - b.difficulty);

  const hasNoResults = filteredPaths.length === 0;

  const dropdownItems = getPathDropdownItems();

  // Get counts for path stats
  const getPathStats = (path: PathMetadata) => {
    const courseCount = path.steps.filter((s) => s.type === "course").length;
    const challengeCount = path.steps.filter(
      (s) => s.type === "challenge"
    ).length;
    return { courseCount, challengeCount };
  };

  const handleScrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: -300,
        behavior: "smooth",
      });
    }
  };

  const handleScrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({
        left: 300,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      className={classNames(
        "flex flex-col gap-y-12",
        isLoading && "animate-pulse"
      )}
    >
      {/* Featured Paths */}
      <div className="relative flex flex-col border-x border-border-light p-1 pb-0 lg:pb-1">
        <Banner title={t("paths.get_started")} variant="brand" />
        <div className="px-1.5 py-3 sm:p-4">
          <div
            ref={carouselRef}
            className={classNames(
              "lg:grid flex pl-4 -mx-4 lg:mx-0 lg:pl-0 lg:grid-cols-3 gap-3 overflow-x-auto lg:overflow-x-hidden snap-x snap-mandatory hide-scrollbar"
            )}
          >
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <PathCardSkeleton key={`featured-skeleton-${index}`} />
                ))
              : initialPaths
                  .filter((path) => path.isFeatured)
                  .slice(0, 3)
                  .map((path) => {
                    const { courseCount, challengeCount } = getPathStats(path);
                    const completedSteps = getPathCompletedSteps(
                      path.steps,
                      courseProgress,
                      challengeStatuses
                    );
                    return (
                      <PathCard
                        className="shrink-0 lg:shrink w-full max-w-[340px] lg:max-w-full snap-center"
                        key={path.slug}
                        name={t(`paths.${path.slug}.title`)}
                        description={t(`paths.${path.slug}.description`)}
                        language={path.language}
                        color={path.color}
                        difficulty={path.difficulty}
                        link={`/paths/${path.slug}`}
                        completedStepsCount={completedSteps}
                        totalStepsCount={path.steps.length}
                        pathSlug={path.slug}
                        estimatedHours={path.estimatedHours}
                        courseCount={courseCount}
                        challengeCount={challengeCount}
                      />
                    );
                  })}
          </div>
          <div className="absolute bottom-0 w-screen h-px bg-border-light left-1/2 -translate-x-1/2" />
        </div>
        <div className="w-full flex justify-center lg:hidden relative z-10">
          <div className="absolute top-0 w-screen h-px bg-border-light left-1/2 -translate-x-1/2" />
          <div className="w-full h-[48px] flex justify-end">
            <button
              disabled={scrollState.isAtStart}
              onClick={handleScrollLeft}
              className="absolute right-11 disabled:text-shade-mute bg-transparent enabled:hover:cursor-pointer enabled:hover:bg-card-solid/50 outline-none border-x text-tertiary hover:text-primary transition-colors border-x-border-light w-[48px] h-[48px] flex items-center justify-center"
            >
              <Icon name="Chevron" className="rotate-90" />
            </button>
            <button
              disabled={scrollState.isAtEnd}
              onClick={handleScrollRight}
              className="mr-[1px] absolute -right-1 disabled:text-shade-mute bg-transparent enabled:hover:cursor-pointer enabled:hover:bg-card-solid/50 outline-none text-tertiary hover:text-primary transition-colors w-[48px] h-[48px] flex items-center justify-center"
            >
              <Icon name="Chevron" className="-rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Full List */}
      <div className="relative px-1 sm:p-4 pb-12 sm:pb-16 flex flex-col gap-y-6 w-full">
        <div className="flex gap-y-3 flex-col lg:flex-row items-start lg:items-center justify-between w-full">
          <div className="w-full md:w-max flex flex-col md:flex-row items-center gap-y-3 md:gap-x-3">
            <Input
              value={searchValue}
              onChange={(value: string) => setSearchValue(value)}
              placeholder="Search..."
              className="w-full md:w-max min-w-[300px]"
              hasMessage={false}
              badge={{
                icon: { name: "Search", size: 16 },
                className: "!h-[30px] !w-[30px]",
              }}
            />
          </div>
          <Tabs
            items={[
              {
                label: "In Progress",
                value: "in-progress",
                disabled: !hasInProgress,
                className: "w-full md:!w-max",
                selected: activeTab === "in-progress",
                onClick: () => setActiveTab("in-progress"),
              },
              {
                label: "All Paths",
                value: "all-paths",
                className: "w-full md:!w-max order-first",
                selected: activeTab === "all-paths",
                onClick: () => setActiveTab("all-paths"),
              },
            ]}
            variant="segmented"
            className="hidden md:flex"
            theme="secondary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <PathCardSkeleton key={`list-skeleton-${index}`} />
              ))
            : filteredPaths.map((path) => {
                const { courseCount, challengeCount } = getPathStats(path);
                const completedSteps = getPathCompletedSteps(
                  path.steps,
                  courseProgress,
                  challengeStatuses
                );
                return (
                  <PathCard
                    key={path.slug}
                    name={t(`paths.${path.slug}.title`)}
                    description={t(`paths.${path.slug}.description`)}
                    language={path.language}
                    color={path.color}
                    difficulty={path.difficulty}
                    link={`/paths/${path.slug}`}
                    completedStepsCount={completedSteps}
                    totalStepsCount={path.steps.length}
                    pathSlug={path.slug}
                    estimatedHours={path.estimatedHours}
                    courseCount={courseCount}
                    challengeCount={challengeCount}
                  />
                );
              })}
        </div>
        {hasNoResults && <PathsEmpty />}
      </div>
    </div>
  );
}

function PathsEmpty() {
  const t = useTranslations();

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-4">
      <Icon name="Lessons" size={18} className="text-shade-tertiary" />
      <div className="text-center">
        <h3 className="text-lg font-medium text-shade-primary">
          {t("paths.empty_title")}
        </h3>
        <p className="text-sm text-shade-tertiary">
          {t("paths.empty_description")}
        </p>
      </div>
    </div>
  );
}
