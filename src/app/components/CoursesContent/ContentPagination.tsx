"use client";

import { useTranslations } from "next-intl";
import { anticipate, motion } from "motion/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { usePersistentStore } from "@/stores/store";
import { Link } from "@/i18n/navigation";
import Icon from "../Icon/Icon";
import { CourseMetadata } from "@/app/utils/course";
import { ChallengeMetadata } from "@/app/utils/challenges";

type ContentPaginationProps = {
  className?: string;
} & (
  | {
      type: "course";
      course: CourseMetadata;
      currentLesson: number;
    }
  | {
      type: "challenge";
      challenge: ChallengeMetadata;
      currentPageSlug?: string;
    }
);

export default function ContentPagination(props: ContentPaginationProps) {
  const { className } = props;
  const t = useTranslations();
  const { setCourseProgress, challengeStatuses } = usePersistentStore();
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isFixed, setIsFixed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsFixed(window.scrollY > 250);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (props.type === "course") {
      setCourseProgress(props.course.slug, props.currentLesson);
    }
  }, [props, setCourseProgress]);

  return (
    <motion.div
      layoutId="course-pagination"
      className={classNames(
        "font-content gradient-border !fixed xl:!sticky z-50 py-5 xl:pb-8 px-4 col-span-3 h-max left-1/2 xl:left-auto -translate-x-1/2 xl:translate-x-0 bottom-8 xl:bottom-auto xl:top-24 bg-card-solid-foreground xl:[background:linear-gradient(180deg,rgba(0,179,179,0.08),rgba(0,179,179,0.02)),#11141A] flex flex-col gap-y-4 rounded-xl  xl:before:[background:linear-gradient(180deg,rgba(0,179,179,0.12),transparent)]",
        className
      )}
    >
      {props.type === "course" && (
        <>
          <div className="flex xl:hidden items-center justify-between min-w-[80dvw] md:min-w-[250px]">
            <button
              onClick={() => {
                router.push(
                  `/courses/${props.course.slug}/${
                    props.course.lessons[props.currentLesson - 2].slug
                  }`
                );
              }}
              disabled={props.currentLesson === 1}
              className={classNames(
                "rounded-full text-shade-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default"
              )}
            >
              <Icon name="ArrowLeft" />
            </button>
            <span className="font-medium">
              {t(
                `courses.${props.course.slug}.lessons.${
                  props.course.lessons[props.currentLesson - 1].slug
                }`
              )}
            </span>
            <button
              onClick={() => {
                router.push(
                  `/courses/${props.course.slug}/${
                    props.course.lessons[props.currentLesson].slug
                  }`
                );
              }}
              disabled={props.currentLesson === props.course.lessons.length}
              className={classNames(
                "rounded-full text-shade-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default"
              )}
            >
              <Icon name="ArrowRight" />
            </button>
          </div>
          <div className="flex-col hidden xl:flex gap-y-4 pl-0">
            <span className="font-mono text-sm pl-1 text-shade-secondary">
              {t("lessons.lessons")}
            </span>
            <div className="flex flex-col gap-y-3 pl-0">
              {props.course.lessons.map((lesson, index) => {
                const isActive = index === props.currentLesson - 1;
                return (
                  <Link
                    href={`/courses/${props.course.slug}/${lesson.slug}`}
                    key={lesson.slug}
                    className="flex flex-col gap-y-2 group"
                  >
                    <div className="flex items-center gap-x-4">
                      <div
                        className={classNames(
                          "w-[18px] group-last:before:!hidden before:w-[2px] before:bg-mute before:h-[20px] before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:top-[calc(100%+2px)] h-[18px] relative flex items-center justify-center rounded-full border-2 border-mute",
                          isActive && "!border-brand-secondary"
                        )}
                      >
                        {isActive && (
                          <motion.div
                            layoutId="lesson-pagination"
                            transition={{ duration: 0.1, ease: anticipate }}
                            className={classNames(
                              "w-[6px] h-[6px] rounded-full bg-brand-secondary"
                            )}
                          ></motion.div>
                        )}
                      </div>
                      <span
                        className={classNames(
                          "text-shade-tertiary/70 hover:text-shade-secondary font-medium truncate transition",
                          isActive && "!text-shade-primary"
                        )}
                      >
                        {t(
                          `courses.${props.course.slug}.lessons.${lesson.slug}`
                        )}
                      </span>
                    </div>
                  </Link>
                );
              })}
              {props.course.challenge && (
                <Link
                  href={`/challenges/${props.course.challenge}?fromCourse=${props.course.slug}`}
                  className="flex items-center gap-x-4 group mt-2"
                >
                  <div
                    className={classNames(
                      "w-[18px] h-[18px] relative flex items-center justify-center rounded-full border-2 border-mute"
                    )}
                  ></div>
                  <div className="flex items-center gap-x-2">
                    <Icon
                      name={
                        ["completed", "claimed"].includes(
                          challengeStatuses[props.course.challenge]
                        )
                          ? "SuccessCircle"
                          : "Challenge"
                      }
                      size={16 as 14}
                      className={classNames("-ml-2 text-brand-tertiary", {
                        "!text-success": ["completed", "claimed"].includes(
                          challengeStatuses[props.course.challenge]
                        ),
                      })}
                    />
                    <span
                      className={classNames(
                        "text-sm font-medium text-brand-tertiary",
                        {
                          "!text-success": ["completed", "claimed"].includes(
                            challengeStatuses[props.course.challenge]
                          ),
                        }
                      )}
                    >
                      {["completed", "claimed"].includes(
                        challengeStatuses[props.course.challenge]
                      )
                        ? t("lessons.challenge_completed")
                        : t("lessons.challenge_incomplete")}
                    </span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </>
      )}
      {props.type === "challenge" &&
        (() => {
          const { challenge, currentPageSlug } = props;
          const allChallengePages = [
            {
              slug: undefined,
              title: t(`challenges.${challenge.slug}.title`),
            },
            ...(challenge.pages?.map((p) => ({
              slug: p.slug,
              title: t(`challenges.${challenge.slug}.pages.${p.slug}.title`),
            })) || []),
          ];

          const currentPageIndex = allChallengePages.findIndex(
            (p) => p.slug === currentPageSlug
          );

          if (currentPageIndex === -1) return null;

          const prevPage = allChallengePages[currentPageIndex - 1];
          const nextPage = allChallengePages[currentPageIndex + 1];
          const currentPage = allChallengePages[currentPageIndex];

          const getLink = (page: { slug: string | undefined }) =>
            page.slug
              ? `/challenges/${challenge.slug}/${page.slug}`
              : `/challenges/${challenge.slug}`;

          return (
            <>
              {/* Mobile Pagination */}
              <div className="flex xl:hidden items-center justify-between min-w-[80dvw] md:min-w-[250px]">
                <button
                  onClick={() => prevPage && router.push(getLink(prevPage))}
                  disabled={!prevPage}
                  className={classNames(
                    "rounded-full text-shade-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default"
                  )}
                >
                  <Icon name="ArrowLeft" />
                </button>
                <span className="font-medium">{currentPage.title}</span>
                <button
                  onClick={() => nextPage && router.push(getLink(nextPage))}
                  disabled={!nextPage}
                  className={classNames(
                    "rounded-full text-shade-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default"
                  )}
                >
                  <Icon name="ArrowRight" />
                </button>
              </div>

              {/* Desktop Pagination */}
              <div className="flex-col hidden xl:flex gap-y-4 pl-0">
                <span className="font-mono text-sm pl-1 text-shade-secondary">
                  {t("ChallengePage.pagination_header")}
                </span>
                <div className="flex flex-col gap-y-3 pl-0">
                  {allChallengePages.map((page, index) => {
                    const isActive = index === currentPageIndex;
                    return (
                      <Link
                        href={getLink(page)}
                        key={page.slug || "main"}
                        className="flex flex-col gap-y-2 group"
                      >
                        <div className="flex items-center gap-x-4">
                          <div
                            className={classNames(
                              "w-[18px] group-last:before:!hidden before:w-[2px] before:bg-mute before:h-[20px] before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:top-[calc(100%+2px)] h-[18px] relative flex items-center justify-center rounded-full border-2 border-mute",
                              isActive && "!border-brand-secondary"
                            )}
                          >
                            {isActive && (
                              <motion.div
                                layoutId="requirement-pagination"
                                transition={{
                                  duration: 0.1,
                                  ease: anticipate,
                                }}
                                className={classNames(
                                  "w-[6px] h-[6px] rounded-full bg-brand-secondary"
                                )}
                              ></motion.div>
                            )}
                          </div>
                          <span
                            className={classNames(
                              "text-shade-tertiary/70 hover:text-shade-secondary font-medium truncate transition",
                              isActive && "!text-shade-primary"
                            )}
                          >
                            {page.title}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </>
          );
        })()}
    </motion.div>
  );
}
