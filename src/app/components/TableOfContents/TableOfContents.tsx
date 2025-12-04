"use client";

import { motion, AnimatePresence } from "motion/react";
import { Icon, CrosshairCorners } from "@blueshift-gg/ui-components";
import { useEffect, useState } from "react";
import { anticipate } from "motion";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { URLS } from "@/constants/urls";

function getGithubSourceUrl(pathname: string): string {
  const url = `${URLS.BLUESHIFT_EDUCATION_REPO}/tree/master/src/app/content`;
  const pathParts = pathname.replace(/^\//, "").split("/");
  const [locale, type, courseOrChallenge, lessonOrPage] = pathParts;

  if (type === "courses" && pathParts.length >= 4) {
    return `${url}/courses/${courseOrChallenge}/${lessonOrPage}/${locale}.mdx`;
  }

  if (type === "challenges" && pathParts.length === 3) {
    return `${url}/challenges/${courseOrChallenge}/${locale}/challenge.mdx`;
  }

  if (type === "challenges" && pathParts.length === 4) {
    return `${url}/challenges/${courseOrChallenge}/${locale}/pages/${lessonOrPage}.mdx`;
  }

  return "";
}

export default function TableOfContents() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedOverrides, setExpandedOverrides] = useState<
    Record<string, boolean>
  >({});
  const [sections, setSections] = useState<
    {
      id: string;
      text: string;
      subsections: { id: string; text: string }[];
    }[]
  >([]);
  const t = useTranslations();
  const pathname = usePathname();
  const githubUrl = getGithubSourceUrl(pathname);
  useEffect(() => {
    // Get all h2 elements from the article
    const article = document.querySelector("article");
    if (!article) return;

    // Ensure all h2 and h3 elements have IDs
    const h2Elements = article.querySelectorAll("h2");
    const h3Elements = article.querySelectorAll("h3");

    h2Elements.forEach((h2) => {
      if (!h2.id) {
        h2.id = `section-${Math.random().toString(36).substring(2, 11)}`;
      }
    });

    h3Elements.forEach((h3) => {
      if (!h3.id) {
        h3.id = `subsection-${Math.random().toString(36).substring(2, 11)}`;
      }
    });

    const sections = Array.from(h2Elements).map((h2) => {
      // Find all h3 elements that come after this h2 but before the next h2
      let nextH2 = h2.nextElementSibling;
      const subsections = [];

      while (nextH2 && nextH2.tagName !== "H2") {
        if (nextH2.tagName === "H3") {
          subsections.push({
            id: nextH2.id,
            text: nextH2.textContent || "",
          });
        }
        nextH2 = nextH2.nextElementSibling;
      }

      return {
        id: h2.id,
        text: h2.textContent || "",
        subsections,
      };
    });
    setSections(sections);

    if (sections.length > 0) {
      setActiveSection(sections[0].id);
    }

    // Create intersection observer for scroll spy
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      }
    );

    // Observe all h2 and h3 elements
    const allHeadings = article.querySelectorAll("h2, h3");
    allHeadings.forEach((heading) => observer.observe(heading));

    return () => {
      allHeadings.forEach((heading) => observer.unobserve(heading));
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: anticipate }}
      className="font-content order-1 lg:order-2 h-max lg:sticky top-[78px] md:col-span-2 lg:col-span-3 xl:col-span-3 flex flex-col gap-y-6 py-6 px-5 lg:py-6 xl:px-6"
    >
      <div className="flex items-center space-x-2">
        <Icon name="Table" size={16} />
        <span className="font-medium font-mono text-shade-primary text-sm">
          {t("contents.contents")}
        </span>
      </div>
      <div className="flex space-x-5 items-stretch">
        {/* Scroll Spy Background */}
        <div className="w-[1.5px] shrink-0 bg-card-solid"></div>
        <div className="flex flex-col gap-y-5 w-max">
          {sections.map((section) => {
            const isSectionActive = activeSection === section.id;
            const containsActiveSubsection = section.subsections.some(
              (sub) => sub.id === activeSection
            );
            const shouldCollapse = sections.length > 5;
            const isExpandedDerived =
              !shouldCollapse || isSectionActive || containsActiveSubsection;

            // Use override if present, otherwise use derived state
            const isExpanded =
              expandedOverrides[section.id] ?? isExpandedDerived;

            return (
              <div key={section.id} className="flex flex-col">
                <a
                  href={`#${section.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveSection(section.id);
                    document
                      .getElementById(section.id)
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`font-mono relative text-sm font-medium text-shade-primary transition hover:text-shade-primary flex items-center`}
                >
                  {activeSection === section.id && (
                    <motion.div
                      className={classNames(
                        "absolute -left-[calc(24px-2.5px)] w-[1.5px] bg-brand-secondary"
                      )}
                      style={{ height: "24px" }}
                      layoutId={`article`}
                      transition={{ duration: 0.4, ease: anticipate }}
                    />
                  )}
                  {section.subsections.length > 0 && (
                    <div
                      className="relative w-[14px] h-[14px] flex items-center justify-center shrink-0 mr-2 cursor-pointer z-10"
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setExpandedOverrides((prev) => ({
                          ...prev,
                          [section.id]: !isExpanded,
                        }));
                      }}
                    >
                      <CrosshairCorners
                        className="text-shade-mute"
                        size={2}
                        animationDelay={0}
                        animationDuration={0}
                      />
                      <span className="font-mono text-[10px] leading-none text-shade-tertiary select-none">
                        {isExpanded ? "-" : "+"}
                      </span>
                    </div>
                  )}
                  {section.text}
                </a>
                <AnimatePresence initial={false}>
                  {section.subsections.length > 0 && isExpanded && (
                    <motion.div
                      initial="closed"
                      animate="open"
                      exit="closed"
                      variants={{
                        open: {
                          height: "auto",
                          opacity: 1,
                          transition: {
                            height: { duration: 0.3, ease: "easeInOut" },
                            opacity: { duration: 0.3, ease: "easeInOut" },
                          },
                          transitionEnd: { overflow: "visible" },
                        },
                        closed: {
                          height: 0,
                          opacity: 0,
                          overflow: "hidden",
                          transition: {
                            height: { duration: 0.3, ease: "easeInOut" },
                            opacity: { duration: 0.3, ease: "easeInOut" },
                          },
                        },
                      }}
                      className="overflow-hidden -ml-8 pl-8"
                    >
                      <div className="pl-2 pt-4 flex flex-col gap-y-3">
                        {section.subsections.map((subsection) => (
                          <div key={subsection.id} className="relative">
                            <a
                              href={`#${subsection.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveSection(subsection.id);
                                document
                                  .getElementById(subsection.id)
                                  ?.scrollIntoView({ behavior: "smooth" });
                              }}
                              className={`font-mono relative flex font-medium text-shade-tertiary text-xs transition hover:text-shade-primary`}
                            >
                              <span /*className="truncate max-w-[80%]"*/>
                                {subsection.text}
                              </span>
                            </a>
                            {activeSection === subsection.id && (
                              <motion.div
                                className="absolute -left-[calc(32px-2.5px)] top-0 w-[1.5px] bg-brand-secondary"
                                style={{ height: "20px" }}
                                layoutId={`article`}
                                transition={{ duration: 0.4, ease: anticipate }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
      {githubUrl ? (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 hover:text-shade-tertiary text-shade-primary"
        >
          <Icon name="Github" size={16} />
          <span className="font-medium font-mono text-sm">
            {t("contents.view_source")}
          </span>
        </a>
      ) : null}
    </motion.div>
  );
}
