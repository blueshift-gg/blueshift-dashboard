"use client";

import { courseColors, CourseMetadata } from "@/app/utils/course";

import { usePersistentStore } from "@/stores/store";
import CourseCard from "../CourseCard/CourseCard";
import classNames from "classnames";
import Icon from "../Icon/Icon";
import { useTranslations } from "next-intl";
import Divider from "../Divider/Divider";
import RewardsEmpty from "./RewardsEmpty";
import RewardsFooter from "./RewardsFooter";
import { motion } from "motion/react";
import { anticipate } from "motion";
import { useWindowSize } from "usehooks-ts";
import { useEffect } from "react";
import useMintNFT from "@/hooks/useMintNFT";

type RewardsListProps = {
  initialCourses: CourseMetadata[];
};

export default function RewardsList({ initialCourses }: RewardsListProps) {
  const t = useTranslations();
  const { view, setView, selectedRewardStatus, courseStatus } =
    usePersistentStore();

  const filteredRewards = initialCourses.filter(
    (course) =>
      selectedRewardStatus.includes(courseStatus[course.slug]) &&
      course.challenge,
  );

  const hasNoResults = filteredRewards.length === 0;
  const hasNoFilters = selectedRewardStatus.length === 0;

  const { width } = useWindowSize();

  useEffect(() => {
    if (width < 768) {
      setView("grid");
    }
  }, [width, setView]);

  return (
    <motion.div
      key={`${view}`}
      className="flex flex-col group-list"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: anticipate }}
    >
      {hasNoFilters && <RewardsEmpty />}
      {hasNoResults && <RewardsEmpty />}
      {!hasNoFilters && !hasNoResults && (
        <>
          {filteredRewards.map((course) => (
            <div key={course.slug} className="flex flex-col group">
              <div className="flex flex-col gap-y-8">
                <div className="flex items-center gap-x-3">
                  <div
                    className="w-[24px] h-[24px] rounded-sm flex items-center justify-center"
                    style={{
                      backgroundColor: `rgb(${courseColors[course.language]},0.10)`,
                    }}
                  >
                    <Icon
                      className="text-brand-secondary"
                      name={course.language}
                    />
                  </div>
                  <span className="text-lg leading-none font-medium text-secondary">
                    {t(`courses.${course.slug}.title`)}
                  </span>
                </div>
                <div
                  className={classNames(
                    "grid",
                    view === "grid"
                      ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                      : "grid-cols-1",
                    "gap-5",
                  )}
                >
                  {course.lessons.map((lesson) => (
                    <CourseCard
                      key={lesson.slug}
                      name={t(`courses.${course.slug}.lessons.${lesson.slug}`)}
                      language={course.language}
                      difficulty={course.difficulty}
                      status={courseStatus[course.slug]}
                      color={course.color}
                      className={classNames(
                        courseStatus[course.slug] === "Locked" && "opacity-50",
                      )}
                      footer={<RewardsFooter course={course} />}
                    />
                  ))}
                </div>
              </div>
              <Divider className="my-12 group-last:hidden" />
            </div>
          ))}
        </>
      )}
    </motion.div>
  );
}
