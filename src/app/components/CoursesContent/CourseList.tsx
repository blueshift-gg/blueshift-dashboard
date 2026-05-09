"use client";

import { Banner, Dropdown, Icon, Input, Tabs } from "@blueshift-gg/ui-components";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useWindowSize } from "usehooks-ts";
import {
  difficultyFilterMap,
  languageFilterMap,
  reverseDifficultyFilterMap,
  reverseLanguageFilterMap,
} from "@/app/utils/common";
import type { CourseLanguages, CourseMetadata } from "@/app/utils/course";
import { getCourseDropdownItems } from "@/app/utils/dropdownItems";
import { recommendCourses } from "@/app/utils/recommendations";
import { usePersistentStore, useStore } from "@/stores/store";
import CourseCard from "../CourseCard/CourseCard";
import CourseCardSkeleton from "../CourseCard/CourseCardSkeleton";
import CoursesEmpty from "./CoursesEmpty";

type CoursesContentProps = {
  searchValue?: string;
  initialCourses?: CourseMetadata[];
  courseLessons?: {
    slug: string;
    totalLessons: number;
    lessons: { number: number; slug: string }[];
  }[];
  isLoading?: boolean;
};

const FEATURED_SKELETON_KEYS = [
  "featured-skeleton-1",
  "featured-skeleton-2",
  "featured-skeleton-3",
] as const;

const COURSE_LIST_SKELETON_KEYS = [
  "list-skeleton-1",
  "list-skeleton-2",
  "list-skeleton-3",
  "list-skeleton-4",
  "list-skeleton-5",
  "list-skeleton-6",
] as const;

export default function CourseList({
  initialCourses = [],
  courseLessons = [],
  isLoading = false,
}: CoursesContentProps) {
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

  // Calculate global in-progress courses to determine tab state
  const globalInProgressCourses = initialCourses.filter((course) => {
    const progress = courseProgress[course.slug] || 0;
    const totalLessons = course.lessons.length;

    if (progress === 0) return false;
    if (progress < totalLessons) return true;
    if (progress === totalLessons && course.challenge) {
      const status = challengeStatuses[course.challenge];
      return status !== "completed" && status !== "claimed";
    }
    return false;
  });

  const hasInProgress = globalInProgressCourses.length > 0;

  // Initialize tab - will be updated by useEffect based on hasInProgress
  const [activeTab, setActiveTab] = useState("all-courses");

  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false);

  const [scrollState, setScrollState] = useState({
    isAtStart: true,
    isAtEnd: false,
  });

  const carouselRef = useRef<HTMLDivElement>(null);

  // Function to update scroll state
  const updateScrollState = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setScrollState({
        isAtStart: scrollLeft === 0,
        isAtEnd: scrollLeft === scrollWidth - clientWidth,
      });
    }
  }, []);

  // Add scroll event listener
  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      // Set initial scroll state
      updateScrollState();

      // Add scroll event listener
      carousel.addEventListener("scroll", updateScrollState);

      // Cleanup
      return () => carousel.removeEventListener("scroll", updateScrollState);
    }
  }, [updateScrollState]);

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

  useEffect(() => {
    setIsMobile(width < 768);
  }, [width]);

  // Track if user has manually changed the tab
  const userChangedTab = useRef(false);

  // Track when user manually changes tab
  const handleTabChange = useCallback((tab: string) => {
    userChangedTab.current = true;
    setActiveTab(tab);
  }, []);

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
        handleTabChange(newStatus || "all-courses");
      } else if (selectedStatuses.length === 1) {
        handleTabChange(selectedStatuses[0]);
      } else {
        handleTabChange("all-courses");
      }
    } else if (typeof value === "string") {
      if (value in difficultyFilterMap) {
        toggleDifficulty(difficultyFilterMap[value]);
      } else if (value in languageFilterMap) {
        toggleLanguage(languageFilterMap[value]);
      } else if (["in-progress", "completed"].includes(value)) {
        handleTabChange(value === activeTab ? "all-courses" : value);
      }
    }
  };

  const globalCompletedCourses = initialCourses.filter((course) => {
    const progress = courseProgress[course.slug] || 0;
    const totalLessons = course.lessons.length;
    return progress === totalLessons;
  });

  const hasCompleted = globalCompletedCourses.length > 0;

  // Set initial tab based on whether user has in-progress courses
  // This handles both initial load and when store values load asynchronously
  useEffect(() => {
    // Only auto-switch if user hasn't manually changed the tab
    if (!userChangedTab.current) {
      if (hasInProgress) {
        setActiveTab("in-progress");
      } else if (activeTab === "in-progress") {
        // If in-progress tab becomes disabled, switch to all-courses
        setActiveTab("all-courses");
      }
    } else {
      // If user manually changed tab, only switch away from in-progress if it becomes disabled
      if (!hasInProgress && activeTab === "in-progress") {
        setActiveTab("all-courses");
      }
    }
  }, [hasInProgress, activeTab]);

  // Filter courses
  const filteredCourses = initialCourses
    .filter((course) => {
      // 1. Search
      const matchesSearch = t(`courses.${course.slug}.title`)
        .toLowerCase()
        .includes((searchValue || "").toLowerCase());

      // 2. Language Filter (Empty = All)
      const matchesLanguage =
        selectedLanguages.length === 0 || selectedLanguages.includes(course.language);

      // 3. Difficulty Filter (Empty = All)
      const matchesDifficulty =
        selectedDifficulties.length === 0 || selectedDifficulties.includes(course.difficulty);

      // 4. Tab Filter
      let matchesTab = true;
      const progress = courseProgress[course.slug] || 0;
      const totalLessons = course.lessons.length;

      if (activeTab === "all-courses") {
        // Not Started tab: only show courses with no progress (progress === 0)
        matchesTab = progress === 0;
      } else if (activeTab === "in-progress") {
        matchesTab =
          (progress > 0 && progress < totalLessons) ||
          (progress === totalLessons &&
            !!course.challenge &&
            !["completed", "claimed"].includes(challengeStatuses[course.challenge]));
      } else if (activeTab === "completed") {
        const isChallengeComplete =
          !course.challenge ||
          ["completed", "claimed"].includes(challengeStatuses[course.challenge]);
        matchesTab = progress === totalLessons && isChallengeComplete;
      }

      return matchesSearch && matchesLanguage && matchesDifficulty && matchesTab;
    })
    .sort((a, b) => a.difficulty - b.difficulty);

  const hasNoResults = filteredCourses.length === 0;

  // Helper function to get the current lesson slug
  const getCurrentLessonSlug = (courseSlug: string) => {
    const progress = courseProgress[courseSlug];
    if (!progress) return "";

    // Find the course lessons
    const courseLessonData = courseLessons.find((c) => c.slug === courseSlug);
    if (!courseLessonData) return "";

    // If progress is 0, return empty string (no current lesson)
    if (progress === 0) return "";

    // Find the lesson with matching number
    const currentLesson = courseLessonData.lessons.find((lesson) => lesson.number === progress);

    return currentLesson?.slug || "";
  };

  const dropdownItems = getCourseDropdownItems(isMobile);

  const seed = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const recommendedCourses = useMemo(
    () =>
      recommendCourses(initialCourses, {
        courseProgress,
        challengeStatuses,
        preferredLanguages: selectedLanguages,
        preferredDifficulties: selectedDifficulties,
        seed,
        limit: 3,
      }),
    [
      initialCourses,
      courseProgress,
      challengeStatuses,
      selectedLanguages,
      selectedDifficulties,
      seed,
    ],
  );

  // Create tabs array with conditional ordering
  const tabsItems = useMemo(() => {
    const notStartedTab = {
      label: "Not Started",
      value: "all-courses",
      className: "w-full md:!w-max",
      selected: activeTab === "all-courses",
      onClick: () => handleTabChange("all-courses"),
    };

    const inProgressTab = {
      label: "In Progress",
      value: "in-progress",
      disabled: !hasInProgress,
      className: classNames("w-full md:!w-max", hasInProgress && "order-first"),
      selected: activeTab === "in-progress",
      onClick: () => handleTabChange("in-progress"),
    };

    const completedTab = {
      label: "Completed",
      value: "completed",
      className: "w-full md:!w-max",
      disabled: !hasCompleted,
      selected: activeTab === "completed",
      onClick: () => handleTabChange("completed"),
    };

    return [notStartedTab, inProgressTab, completedTab];
  }, [activeTab, hasInProgress, hasCompleted, handleTabChange]);

  return (
    <div className={classNames("flex flex-col gap-y-12", isLoading && "animate-pulse")}>
      {/* Get Started */}
      <div className="relative flex flex-col border-x border-border-light p-1 pb-0 lg:pb-1">
        <Banner title={t("lessons.get_started")} variant="brand" />
        <div className="px-1.5 py-3 sm:p-4">
          <div
            ref={carouselRef}
            className={classNames(
              "lg:grid flex pl-4 -mx-4 lg:mx-0 lg:pl-0 lg:grid-cols-3 gap-3 overflow-x-auto lg:overflow-x-hidden snap-x snap-mandatory hide-scrollbar",
            )}
          >
            {isLoading
              ? FEATURED_SKELETON_KEYS.map((skeletonKey) => (
                  <CourseCardSkeleton key={skeletonKey} />
                ))
              : recommendedCourses.map((course) => {
                  const totalLessons =
                    courseLessons.find((c) => c.slug === course.slug)?.totalLessons || 0;
                  const currentLessonSlug = getCurrentLessonSlug(course.slug);
                  const completedLessonsCount = courseProgress[course.slug] || 0;
                  let link: string | undefined;
                  if (currentLessonSlug && course.slug) {
                    link = `/courses/${course.slug}/${currentLessonSlug}`;
                  } else if (course.slug && !currentLessonSlug) {
                    link = `/courses/${course.slug}`;
                  }
                  return (
                    <CourseCard
                      className="w-full max-w-[340px] shrink-0 snap-center lg:max-w-full lg:shrink"
                      key={course.slug}
                      name={t(`courses.${course.slug}.title`)}
                      language={course.language}
                      color={course.color}
                      difficulty={course.difficulty}
                      link={link}
                      completedLessonsCount={completedLessonsCount}
                      totalLessonCount={totalLessons}
                      courseSlug={course.slug}
                      description={t(`courses.${course.slug}.description`)}
                    />
                  );
                })}
          </div>
          <div className="absolute bottom-0 left-1/2 h-px w-screen -translate-x-1/2 bg-border-light" />
        </div>
        <div className="relative z-10 flex w-full justify-center lg:hidden">
          <div className="absolute top-0 left-1/2 h-px w-screen -translate-x-1/2 bg-border-light" />
          <div className="flex h-[48px] w-full justify-end">
            <button
              type="button"
              disabled={scrollState.isAtStart}
              onClick={handleScrollLeft}
              className="text-tertiary hover:text-primary absolute right-11 flex h-[48px] w-[48px] items-center justify-center border-x border-x-border-light bg-transparent transition-colors outline-none enabled:hover:cursor-pointer enabled:hover:bg-card-solid/50 disabled:text-shade-mute"
            >
              <Icon name="Chevron" className="rotate-90" />
            </button>
            <button
              type="button"
              disabled={scrollState.isAtEnd}
              onClick={handleScrollRight}
              className="text-tertiary hover:text-primary absolute -right-1 mr-[1px] flex h-[48px] w-[48px] items-center justify-center bg-transparent transition-colors outline-none enabled:hover:cursor-pointer enabled:hover:bg-card-solid/50 disabled:text-shade-mute"
            >
              <Icon name="Chevron" className="-rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Full List */}
      <div className="relative flex w-full flex-col gap-y-6 px-1 pb-12 sm:p-4 sm:pb-16">
        <div className="flex w-full flex-col items-start justify-between gap-y-3 lg:flex-row lg:items-center">
          <div className="flex w-full flex-col items-center gap-y-3 md:w-max md:flex-row md:gap-x-3">
            <Input
              value={searchValue}
              onChange={(value: string) => setSearchValue(value)}
              placeholder="Search..."
              className="w-full min-w-[300px] md:w-max"
              hasMessage={false}
              badge={{
                icon: { name: "Search", size: 16 },
                className: "!h-[30px] !w-[30px]",
              }}
            />
            <Dropdown
              className="w-full md:min-w-[150px]"
              handleChange={handleFilterChange}
              menuIcon={{ name: "Filter", size: 16 }}
              label="Filters"
              multiSelectLabel={`Filters`}
              selectedItem={[
                ...selectedLanguages.map((l) => reverseLanguageFilterMap[l]),
                ...selectedDifficulties.map(
                  (d) => reverseDifficultyFilterMap[d as keyof typeof reverseDifficultyFilterMap],
                ),
                ...(activeTab !== "all-courses" ? [activeTab] : []),
              ]}
              multiple={true}
              showSelectAll={false}
              items={dropdownItems}
            />
          </div>
          <Tabs
            items={tabsItems}
            variant="segmented"
            className="hidden md:flex"
            theme="secondary"
          />
        </div>
        <div className={classNames("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3")}>
          {isLoading
            ? COURSE_LIST_SKELETON_KEYS.map((skeletonKey) => (
                <CourseCardSkeleton key={skeletonKey} />
              ))
            : filteredCourses.map((course) => {
                const totalLessons =
                  courseLessons.find((c) => c.slug === course.slug)?.totalLessons || 0;
                const currentLessonSlug = getCurrentLessonSlug(course.slug);
                const completedLessonsCount = courseProgress[course.slug] || 0;
                let link: string | undefined;
                if (currentLessonSlug && course.slug) {
                  link = `/courses/${course.slug}/${currentLessonSlug}`;
                } else if (course.slug && !currentLessonSlug) {
                  link = `/courses/${course.slug}`;
                }
                return (
                  <CourseCard
                    key={course.slug}
                    name={t(`courses.${course.slug}.title`)}
                    language={course.language}
                    color={course.color}
                    difficulty={course.difficulty}
                    link={link}
                    completedLessonsCount={completedLessonsCount}
                    totalLessonCount={totalLessons}
                    courseSlug={course.slug}
                    description={t(`courses.${course.slug}.description`)}
                  />
                );
              })}
        </div>
      </div>
      {hasNoResults && <CoursesEmpty />}
    </div>
  );
}
