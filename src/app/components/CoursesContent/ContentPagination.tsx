"use client";

import { useTranslations } from "next-intl";
import { anticipate, motion } from "motion/react";
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { usePersistentStore } from "@/stores/store";
import { Link } from "@/i18n/navigation";
import { Icon } from "@blueshift-gg/ui-components";
import { CourseMetadata } from "@/app/utils/course";
import { ChallengeMetadata } from "@/app/utils/challenges";
import { CrosshairCorners } from "@blueshift-gg/ui-components";

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
    <div className="w-[calc(100dvw-2rem)] md:max-w-[350px] xl:w-full z-30 xl:p-5 col-span-3 xl:col-span-3 bottom-8 !fixed left-1/2 -translate-x-1/2 xl:bottom-0 xl:!relative">
      <motion.div
        layoutId="course-pagination"
        className={classNames(
          "bg-card-solid/50 backdrop-blur-xl border border-border flex flex-col gap-y-4 py-4 relative xl:!sticky xl:top-[calc(78px+1rem)]",
          className
        )}
      >
        <CrosshairCorners
          size={4}
          variant="corners"
          animationDelay={0}
          animationDuration={0}
        />
        {props.type === "course" && (
          <>
            <div className="flex xl:hidden items-center justify-between min-w-[80dvw] md:min-w-[250px] px-4">
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
                  "text-shade-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default"
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
                  "text-shade-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default"
                )}
              >
                <Icon name="ArrowRight" />
              </button>
            </div>
            <div className="flex-col hidden xl:flex gap-y-4">
              <span className="font-mono text-sm text-shade-primary pl-4">
                {t("lessons.lessons")}
              </span>
              <div className="flex flex-col gap-y-1.5 pl-0">
                {props.course.lessons.map((lesson, index) => {
                  const isActive = index === props.currentLesson - 1;
                  return (
                    <Link
                      href={`/courses/${props.course.slug}/${lesson.slug}`}
                      key={lesson.slug}
                      className={classNames(
                        "flex items-center group relative pl-6 py-2",
                        {
                          "bg-brand-primary/5 !text-brand-primary hover:!text-brand-secondary":
                            isActive,
                          "text-shade-tertiary hover:!text-shade-primary":
                            !isActive,
                        }
                      )}
                    >
                      <div className="flex items-center">
                        {isActive && (
                          <motion.div
                            layoutId="lesson-pagination"
                            transition={{ duration: 0.1, ease: anticipate }}
                          >
                            <CrosshairCorners
                              size={4}
                              variant="bordered"
                              borders={["left"]}
                              animationDelay={0}
                              animationDuration={0}
                            />
                          </motion.div>
                        )}
                        <span
                          className={classNames(
                            "font-medium truncate transition text-sm font-mono",
                            isActive && "pl-1"
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
                <div className="flex xl:hidden items-center justify-between min-w-[80dvw] md:min-w-[250px] px-4">
                  <button
                    onClick={() => prevPage && router.push(getLink(prevPage))}
                    disabled={!prevPage}
                    className={classNames(
                      "text-shade-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default"
                    )}
                  >
                    <Icon name="ArrowLeft" />
                  </button>
                  <span className="font-medium">{currentPage.title}</span>
                  <button
                    onClick={() => nextPage && router.push(getLink(nextPage))}
                    disabled={!nextPage}
                    className={classNames(
                      "text-shade-tertiary hover:bg-background-primary transition p-1.5 hover:text-brand-primary cursor-pointer disabled:opacity-40 disabled:cursor-default"
                    )}
                  >
                    <Icon name="ArrowRight" />
                  </button>
                </div>

                {/* Desktop Pagination */}
                <div className="flex-col hidden xl:flex gap-y-4">
                  <span className="font-mono text-sm text-shade-primary pl-4">
                    {t("ChallengePage.pagination_header")}
                  </span>
                  <div className="flex flex-col gap-y-1.5 pl-0">
                    {allChallengePages.map((page, index) => {
                      const isActive = index === currentPageIndex;
                      return (
                        <Link
                          href={getLink(page)}
                          key={page.slug || "main"}
                          className={classNames(
                            "flex items-center group relative pl-6 py-2",
                            {
                              "bg-brand-primary/5 !text-brand-primary hover:!text-brand-secondary":
                                isActive,
                              "text-shade-tertiary hover:!text-shade-primary":
                                !isActive,
                            }
                          )}
                        >
                          <div className="flex items-center">
                            {isActive && (
                              <motion.div
                                layoutId="requirement-pagination"
                                transition={{
                                  duration: 0.1,
                                  ease: anticipate,
                                }}
                              >
                                <CrosshairCorners
                                  size={4}
                                  variant="bordered"
                                  borders={["left"]}
                                  animationDelay={0}
                                  animationDuration={0}
                                />
                              </motion.div>
                            )}
                            <span
                              className={classNames(
                                "font-medium truncate transition text-sm font-mono",
                                isActive && "pl-1"
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
    </div>
  );
}
