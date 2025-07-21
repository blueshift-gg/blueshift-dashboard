"use client";

import { motion } from "motion/react";
import Icon from "../Icon/Icon";
import { useEffect, useState } from "react";
import { anticipate } from "motion";
import classNames from "classnames";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

function getGithubSourceUrl(pathname: string): string {
  const url =
    "https://github.com/blueshift-gg/blueshift-dashboard/tree/master/src/app/content";
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
        h2.id = `section-${Math.random().toString(36).substr(2, 9)}`;
      }
    });

    h3Elements.forEach((h3) => {
      if (!h3.id) {
        h3.id = `subsection-${Math.random().toString(36).substr(2, 9)}`;
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
      className="font-content order-1 lg:order-2 h-max lg:sticky top-24 md:col-span-2 lg:col-span-3 flex flex-col gap-y-8"
    >
      <div className="flex items-center space-x-2">
        <Icon name="Table" />
        <span className="font-medium font-mono text-primary">
          {t("contents.contents")}
        </span>
      </div>
      <div className="flex space-x-5 items-stretch">
        {/* Scroll Spy Background */}
        <div className="w-[3px] flex-shrink-0 bg-background-card rounded-full"></div>
        <div className="flex flex-col gap-y-5 w-max">
          {sections.map((section) => (
            <div key={section.id} className="flex flex-col gap-y-4">
              <a
                href={`#${section.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveSection(section.id);
                  document
                    .getElementById(section.id)
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className={`relative text-sm font-medium text-secondary transition hover:text-primary`}
              >
                {activeSection === section.id && (
                  <motion.div
                    className={classNames(
                      "absolute -left-[calc(24px-1px)] w-[3px] bg-brand-secondary",
                      {
                        "rounded-t-full":
                          activeSection === section.id &&
                          sections[0].id === section.id,
                        "rounded-b-full":
                          activeSection === section.id &&
                          sections[sections.length - 1].id === section.id,
                      }
                    )}
                    style={{ height: "24px" }}
                    layoutId={`article`}
                    transition={{ duration: 0.4, ease: anticipate }}
                  />
                )}
                {section.text}
              </a>
              {section.subsections.length > 0 && (
                <div className="pl-4 flex flex-col gap-y-3">
                  {section.subsections.map((subsection) => (
                    <a
                      key={subsection.id}
                      href={`#${subsection.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveSection(subsection.id);
                        document
                          .getElementById(subsection.id)
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className={`relative flex font-medium text-tertiary text-sm transition hover:text-primary`}
                    >
                      {activeSection === subsection.id && (
                        <motion.div
                          className="absolute -left-[calc(40px-1px)] w-[3px] bg-brand-secondary"
                          style={{ height: "20px" }}
                          layoutId={`article`}
                          transition={{ duration: 0.4, ease: anticipate }}
                        />
                      )}
                      <span /*className="truncate max-w-[80%]"*/>
                        {subsection.text}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {githubUrl ? (
        <a
          href={githubUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 hover:text-tertiary text-primary"
        >
          <Icon name="Github" />
          <span className="font-medium font-mono">
            {t("contents.view_source")}
          </span>
        </a>
      ) : null}
    </motion.div>
  );
}
