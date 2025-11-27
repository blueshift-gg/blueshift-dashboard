"use client";

import {
  courseColors,
  CourseMetadata,
  CourseLanguages,
} from "@/app/utils/course";
import {
  languageFilterMap,
  reverseLanguageFilterMap,
  difficultyFilterMap,
  reverseDifficultyFilterMap,
} from "@/app/utils/common";
import { usePersistentStore } from "@/stores/store";
import CourseCard from "../CourseCard/CourseCard";
import classNames from "classnames";
import { Icon, Difficulty } from "@blueshift-gg/ui-components";
import { useTranslations } from "next-intl";
import { Divider } from "@blueshift-gg/ui-components";
import CoursesEmpty from "./CoursesEmpty";
import { motion } from "motion/react";
import { anticipate } from "motion";
import { useStore } from "@/stores/store";
import { useWindowSize } from "usehooks-ts";
import { useEffect, useRef, useState } from "react";
import { Banner, Dropdown, Input, Tabs } from "@blueshift-gg/ui-components";
import CourseCardSkeleton from "../CourseCard/CourseCardSkeleton";

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
  const [activeTab, setActiveTab] = useState("all-courses");
  const { width } = useWindowSize();
  const [isMobile, setIsMobile] = useState(false);

  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
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
      // Set initial scroll state
      updateScrollState();

      // Add scroll event listener
      carousel.addEventListener("scroll", updateScrollState);

      // Cleanup
      return () => carousel.removeEventListener("scroll", updateScrollState);
    }
  }, []);

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
        setActiveTab(newStatus || "all-courses");
      } else if (selectedStatuses.length === 1) {
        setActiveTab(selectedStatuses[0]);
      } else {
        setActiveTab("all-courses");
      }
    } else if (typeof value === "string") {
      if (value in difficultyFilterMap) {
        toggleDifficulty(difficultyFilterMap[value]);
      } else if (value in languageFilterMap) {
        toggleLanguage(languageFilterMap[value]);
      } else if (["in-progress", "completed"].includes(value)) {
        setActiveTab(value === activeTab ? "all-courses" : value);
      }
    }
  };

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

  // Disable In Progress tab if no courses are in progress
  useEffect(() => {
    if (!hasInProgress && activeTab === "in-progress") {
      setActiveTab("all-courses");
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
        selectedLanguages.length === 0 ||
        selectedLanguages.includes(course.language);

      // 3. Difficulty Filter (Empty = All)
      const matchesDifficulty =
        selectedDifficulties.length === 0 ||
        selectedDifficulties.includes(course.difficulty);

      // 4. Tab Filter
      let matchesTab = true;
      const progress = courseProgress[course.slug] || 0;
      const totalLessons = course.lessons.length;

      if (activeTab === "in-progress") {
        matchesTab =
          (progress > 0 && progress < totalLessons) ||
          (progress === totalLessons &&
            !!course.challenge &&
            !["completed", "claimed"].includes(
              challengeStatuses[course.challenge]
            ));
      } else if (activeTab === "completed") {
        const isChallengeComplete =
          !course.challenge ||
          ["completed", "claimed"].includes(
            challengeStatuses[course.challenge]
          );
        matchesTab = progress === totalLessons && isChallengeComplete;
      }

      return (
        matchesSearch && matchesLanguage && matchesDifficulty && matchesTab
      );
    })
    .sort((a, b) => a.difficulty - b.difficulty);

  const hasNoResults = filteredCourses.length === 0;
  const hasNoFilters =
    !searchValue &&
    selectedLanguages.length === 0 &&
    selectedDifficulties.length === 0 &&
    activeTab === "all-courses";

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
    const currentLesson = courseLessonData.lessons.find(
      (lesson) => lesson.number === progress
    );

    return currentLesson?.slug || "";
  };

  const dropdownItems = [
    {
      label: "Difficulty",
      value: "difficulty",
      icon: <Difficulty size={16} />,
      children: [
        {
          label: "Beginner",
          value: "beginner",
          icon: <Difficulty size={16} difficulties={[1]} />,
        },
        {
          label: "Intermediate",
          value: "intermediate",
          icon: <Difficulty size={16} difficulties={[2]} />,
        },
        {
          label: "Advanced",
          value: "advanced",
          icon: <Difficulty size={16} difficulties={[3]} />,
        },
        {
          label: "Expert",
          value: "expert",
          icon: <Difficulty size={16} difficulties={[4]} />,
        },
      ],
    },
    {
      label: "Category",
      value: "programming",
      icon: { name: "Code" as const },
      children: [
        {
          label: "Assembly",
          value: "assembly",
          icon: { name: "Assembly" as const },
        },
        {
          label: "Anchor",
          value: "anchor",
          icon: { name: "Anchor" as const },
        },
        {
          label: "General",
          value: "general",
          icon: { name: "General" as const },
        },
        {
          label: "Rust",
          value: "rust",
          icon: { name: "Rust" as const },
        },
        {
          label: "TypeScript",
          value: "typescript",
          icon: { name: "Typescript" as const },
        },
      ],
    },
    ...(isMobile
      ? [
          {
            label: "Status",
            value: "status",
            icon: { name: "Progress" as const },
            children: [
              {
                label: "In Progress",
                value: "in-progress",
              },
              {
                label: "Completed",
                value: "completed",
              },
            ],
          },
        ]
      : []),
  ];

  return (
    <div
      className={classNames(
        "flex flex-col gap-y-12",
        isLoading && "animate-pulse"
      )}
    >
      {/* Get Started */}
      <div className="relative flex flex-col border-x border-border-light p-1 pb-0 lg:pb-1">
        <Banner title={t("lessons.get_started")} variant="Brand" />
        <div className="px-1.5 py-3 sm:p-4">
          <div
            ref={carouselRef}
            className={classNames(
              "lg:grid flex pl-4 -mx-4 lg:mx-0 lg:pl-0 lg:grid-cols-3 gap-3 overflow-x-auto lg:overflow-x-hidden snap-x snap-mandatory hide-scrollbar"
            )}
          >
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <CourseCardSkeleton key={`featured-skeleton-${index}`} />
                ))
              : initialCourses
                  .filter((course) => course.isFeatured)
                  .slice(0, 3)
                  .map((course) => {
                    const totalLessons =
                      courseLessons.find((c) => c.slug === course.slug)
                        ?.totalLessons || 0;
                    const currentLessonSlug = getCurrentLessonSlug(course.slug);
                    const completedLessonsCount =
                      courseProgress[course.slug] || 0;
                    let link;
                    if (currentLessonSlug && course.slug) {
                      link = `/courses/${course.slug}/${currentLessonSlug}`;
                    } else if (course.slug && !currentLessonSlug) {
                      link = `/courses/${course.slug}`;
                    }
                    return (
                      <CourseCard
                        className="shrink-0 lg:shrink w-full max-w-[340px] lg:max-w-full snap-center"
                        key={course.slug}
                        name={t(`courses.${course.slug}.title`)}
                        language={course.language}
                        color={course.color}
                        difficulty={course.difficulty}
                        link={link}
                        completedLessonsCount={completedLessonsCount}
                        totalLessonCount={totalLessons}
                        courseSlug={course.slug}
                        currentLessonSlug={currentLessonSlug}
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
            <Dropdown
              className="w-full md:min-w-[150px]"
              handleChange={handleFilterChange}
              menuIcon={{ name: "Filter", size: 16 }}
              label="Filters"
              multiSelectLabel={`Filters`}
              selectedItem={[
                ...selectedLanguages.map((l) => reverseLanguageFilterMap[l]),
                ...selectedDifficulties.map((d) => reverseDifficultyFilterMap[d as keyof typeof reverseDifficultyFilterMap]),
                ...(activeTab !== "all-courses" ? [activeTab] : []),
              ]}
              multiple={true}
              showSelectAll={false}
              items={dropdownItems}
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
                label: "All Courses",
                value: "all-courses",
                className: "w-full md:!w-max order-first",
                selected: activeTab === "all-courses",
                onClick: () => setActiveTab("all-courses"),
              },
            ]}
            variant="segmented"
            className="hidden md:flex"
            theme="secondary"
          />
        </div>
        <div
          className={classNames(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
          )}
        >
          {isLoading
            ? Array.from({ length: 6 }).map((_, index) => (
                <CourseCardSkeleton key={`list-skeleton-${index}`} />
              ))
            : filteredCourses.map((course) => {
                const totalLessons =
                  courseLessons.find((c) => c.slug === course.slug)
                    ?.totalLessons || 0;
                const currentLessonSlug = getCurrentLessonSlug(course.slug);
                const completedLessonsCount = courseProgress[course.slug] || 0;
                let link;
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
                    currentLessonSlug={currentLessonSlug}
                  />
                );
              })}
        </div>
      </div>
      {hasNoResults && <CoursesEmpty />}
    </div>
  );
}
