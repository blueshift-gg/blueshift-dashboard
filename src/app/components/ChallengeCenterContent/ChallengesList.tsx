"use client";

import { usePersistentStore, useStore } from "@/stores/store";
import classNames from "classnames";
import { Icon } from "@blueshift-gg/ui-components";
import { useTranslations } from "next-intl";
import { getChallengeDropdownItems } from "@/app/utils/dropdownItems";
import { useEffect, useState, useMemo, useRef, forwardRef } from "react";
import { ChallengeMetadata } from "@/app/utils/challenges";
import ChallengeCard from "../ChallengeCard/ChallengeCard";
import NFTViewer from "../NFTViewer/NFTViewer";
import { useNftOwnership } from "@/hooks/useNftOwnership";
import ChallengeCardSkeleton from "../ChallengeCard/ChallengeCardSkeleton";
import ChallengesEmpty from "./ChallengesEmpty";
import { Banner, Dropdown, Input, Tabs } from "@blueshift-gg/ui-components";
import { useWindowSize } from "usehooks-ts";
import { CourseLanguages } from "@/app/utils/course";
import { PaginationButton } from "@blueshift-gg/ui-components/Pagination";

const challengeSections = {
  Anchor: {
    icon: "Anchor",
    title: "languages.anchor",
  },
  Rust: {
    icon: "Rust",
    title: "languages.rust",
  },
  Typescript: {
    icon: "Typescript",
    title: "languages.typescript",
  },
  Assembly: {
    icon: "Assembly",
    title: "languages.assembly",
  },
  General: {
    icon: "General",
    title: "languages.general",
  },
} as const;

type ChallengesListProps = {
  initialChallenges?: ChallengeMetadata[];
  isLoading?: boolean;
};

const ScrollableSection = forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string; onScroll?: () => void }
>(({ children, className, onScroll }, ref) => {
  return (
    <div className="relative group/scroll p-2">
      <div
        ref={ref}
        onScroll={onScroll}
        className={classNames(
          "flex gap-3 overflow-x-auto snap-x snap-mandatory hide-scrollbar--always -mx-3 px-3",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
});

ScrollableSection.displayName = "ScrollableSection";

type ChallengeSectionProps = {
  language: string;
  section: { icon: string; title: string };
  challenges: ChallengeMetadata[];
  setIsNFTViewerOpen: (isOpen: boolean) => void;
  setSelectedChallenge: (challenge: ChallengeMetadata) => void;
  t: any;
  challengeStatuses: Record<string, string>;
};

function ChallengeSection({
  language,
  section,
  challenges,
  setIsNFTViewerOpen,
  setSelectedChallenge,
  t,
  challengeStatuses,
}: ChallengeSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = useState({
    isAtStart: true,
    isAtEnd: false,
  });

  const updateScrollState = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      // Use a small threshold for floating point comparisons
      const isAtEnd = Math.abs(scrollWidth - clientWidth - scrollLeft) < 2;
      setScrollState({
        isAtStart: scrollLeft === 0,
        isAtEnd: isAtEnd,
      });
    }
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
  }, [challenges]);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      scrollRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="flex flex-col group/section border border-border-light">
      <div className="flex flex-col gap-y-1 p-1">
        <Banner
          icon={{ name: section.icon as any, size: 16 }}
          title={t(section.title)}
          variant={language as any}
        >
          <span className="text-current ml-auto">
            {
              challenges.filter(
                (challenge) => challengeStatuses[challenge.slug] === "completed"
              ).length
            }
            /{challenges.length} completed
          </span>
        </Banner>
        <ScrollableSection ref={scrollRef} onScroll={updateScrollState}>
          {challenges.map((challenge) => (
            <ChallengeCard
              key={challenge.slug}
              challenge={challenge}
              className="shrink-0 w-full sm:w-[calc(50%-12px)] lg:w-[calc(25%-6px)] snap-center"
              setIsNFTViewerOpen={setIsNFTViewerOpen}
              setSelectedChallenge={setSelectedChallenge}
            />
          ))}
        </ScrollableSection>
      </div>

      <div className="relative bottom-0 w-full h-px bg-border-light left-1/2 -translate-x-1/2" />

      <div className="p-3 flex gap-x-1">
        <PaginationButton
          isControl={true}
          label="Previous"
          onClick={() => handleScroll("left")}
          disabled={scrollState.isAtStart}
        />
        <PaginationButton
          isControl={true}
          controlDirection="right"
          label="Next"
          onClick={() => handleScroll("right")}
          disabled={scrollState.isAtEnd}
        />
      </div>
    </div>
  );
}

export default function ChallengesList({
  initialChallenges = [],
  isLoading = false,
}: ChallengesListProps) {
  const t = useTranslations();

  const {
    challengeStatuses,
    claimChallenges,
    selectedLanguages,
    toggleLanguage,
    setLanguages,
    selectedDifficulties,
    toggleDifficulty,
    setDifficulties,
  } = usePersistentStore();

  const { searchValue, setSearchValue } = useStore();
  const [activeTab, setActiveTab] = useState("open");
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

  const { ownership, error: ownershipError } =
    useNftOwnership(initialChallenges);

  useEffect(() => {
    setIsMobile(width < 768);
  }, [width]);

  useEffect(() => {
    if (ownershipError) {
      console.error("Error checking NFT ownership:", ownershipError);
      return;
    }

    const challengesToUpdate = initialChallenges
      .filter(
        (challenge) =>
          ownership[challenge.slug] &&
          challengeStatuses[challenge.slug] !== "claimed"
      )
      .map((challenge) => challenge.slug);

    if (challengesToUpdate.length > 0) {
      claimChallenges(challengesToUpdate);
    }
  }, [
    ownership,
    ownershipError,
    initialChallenges,
    claimChallenges,
    challengeStatuses,
  ]);

  const filteredChallenges = useMemo(
    () =>
      initialChallenges
        .filter((challenge) => {
          // 1. Search
          const matchesSearch = t(`challenges.${challenge.slug}.title`)
            .toLowerCase()
            .includes((searchValue || "").toLowerCase());

          // 2. Language Filter (Empty = All)
          const matchesLanguage =
            selectedLanguages.length === 0 ||
            selectedLanguages.includes(challenge.language);

          // 3. Difficulty Filter (Empty = All)
          const matchesDifficulty =
            selectedDifficulties.length === 0 ||
            selectedDifficulties.includes(challenge.difficulty);

          // 4. Tab Filter (Status)
          let matchesTab = true;
          const status = challengeStatuses[challenge.slug] || "open";

          if (activeTab === "open") {
            matchesTab = status === "open";
          } else if (activeTab === "completed") {
            matchesTab = status === "completed";
          } else if (activeTab === "claimed") {
            matchesTab = status === "claimed";
          }

          return (
            matchesSearch && matchesLanguage && matchesDifficulty && matchesTab
          );
        })
        .sort((a, b) => a.difficulty - b.difficulty),
    [
      initialChallenges,
      searchValue,
      selectedLanguages,
      selectedDifficulties,
      activeTab,
      challengeStatuses,
      t,
    ]
  );

  const hasNoResults = filteredChallenges.length === 0;
  const hasNoFilters =
    !searchValue &&
    selectedLanguages.length === 0 &&
    selectedDifficulties.length === 0 &&
    activeTab === "open";

  const [isNFTViewerOpen, setIsNFTViewerOpen] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState<ChallengeMetadata>(
    {
      unitName: "",
      language: "Typescript",
      difficulty: 1,
      slug: "",
      color: "",
      isFeatured: false,
      apiPath: "",
      requirements: [],
    }
  );

  const featuredChallenges = useMemo(() => {
    return initialChallenges
      .filter((c) => c.isFeatured)
      .slice(0, 3)
      .sort((a, b) => {
        const statusOrder = { open: 0, completed: 1, claimed: 2 };
        const aStatus = challengeStatuses[a.slug] || "open";
        const bStatus = challengeStatuses[b.slug] || "open";
        return statusOrder[aStatus] - statusOrder[bStatus];
      });
  }, [initialChallenges, challengeStatuses]);

  const difficultyMap: Record<string, number> = {
    beginner: 1,
    intermediate: 2,
    advanced: 3,
    expert: 4,
  };

  const languageMap: Record<string, CourseLanguages> = {
    assembly: "Assembly",
    anchor: "Anchor",
    general: "General",
    rust: "Rust",
    typescript: "Typescript",
  };

  const reverseDifficultyMap: Record<number, string> = {
    1: "beginner",
    2: "intermediate",
    3: "advanced",
    4: "expert",
  };

  const reverseLanguageMap: Record<string, string> = {
    Assembly: "assembly",
    Anchor: "anchor",
    General: "general",
    Rust: "rust",
    Typescript: "typescript",
  };

  const handleFilterChange = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
      const newLanguages: CourseLanguages[] = [];
      const newDifficulties: number[] = [];
      const statusOptions = ["open", "completed", "claimed"];
      const selectedStatuses: string[] = [];

      value.forEach((v) => {
        if (v in difficultyMap) {
          newDifficulties.push(difficultyMap[v]);
        } else if (v in languageMap) {
          newLanguages.push(languageMap[v]);
        } else if (statusOptions.includes(v)) {
          selectedStatuses.push(v);
        }
      });

      setLanguages(newLanguages);
      setDifficulties(newDifficulties);

      if (selectedStatuses.length > 1) {
        const newStatus = selectedStatuses.find((s) => s !== activeTab);
        setActiveTab(newStatus || "open");
      } else if (selectedStatuses.length === 1) {
        setActiveTab(selectedStatuses[0]);
      } else {
        setActiveTab("open");
      }
    } else if (typeof value === "string") {
      if (value in difficultyMap) {
        toggleDifficulty(difficultyMap[value]);
      } else if (value in languageMap) {
        toggleLanguage(languageMap[value]);
      } else if (["open", "completed", "claimed"].includes(value)) {
        setActiveTab(value === activeTab ? "open" : value);
      }
    }
  };

  const dropdownItems = getChallengeDropdownItems(isMobile);

  return (
    <div
      className={classNames(
        "flex flex-col gap-y-12",
        isLoading && "animate-pulse"
      )}
    >
      <NFTViewer
        isOpen={isNFTViewerOpen}
        onClose={() => setIsNFTViewerOpen(false)}
        challengeName={selectedChallenge.unitName}
        challengeLanguage={selectedChallenge.language}
        challengeDifficulty={selectedChallenge.difficulty}
      />

      {/* Get Started / Featured */}
      {(isLoading || featuredChallenges.length > 0) && (
        <div className="relative flex flex-col border-x border-border-light p-1 pb-0 lg:pb-1">
          <Banner title={t("ChallengeCenter.get_started")} variant="brand" />
          <div className="px-1.5 py-3 sm:p-4">
            <div
              ref={carouselRef}
              className={classNames(
                "flex pl-4 -mx-4 lg:mx-0 lg:pl-0 gap-3 overflow-x-auto lg:overflow-x-hidden snap-x snap-mandatory hide-scrollbar"
              )}
            >
              {isLoading
                ? Array.from({ length: 3 }).map((_, index) => (
                    <ChallengeCardSkeleton />
                  ))
                : featuredChallenges.map((challenge) => (
                    <ChallengeCard
                      key={challenge.slug}
                      challenge={challenge}
                      className="shrink-0 w-full sm:w-[calc(50%-8px)] lg:w-[calc(25%-8px)] snap-center max-w-none"
                      setIsNFTViewerOpen={setIsNFTViewerOpen}
                      setSelectedChallenge={setSelectedChallenge}
                    />
                  ))}
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
                className="mr-px absolute -right-1 disabled:text-shade-mute bg-transparent enabled:hover:cursor-pointer enabled:hover:bg-card-solid/50 outline-none text-tertiary hover:text-primary transition-colors w-[48px] h-[48px] flex items-center justify-center"
              >
                <Icon name="Chevron" className="-rotate-90" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full List with Filters */}
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
                ...selectedLanguages.map((l) => reverseLanguageMap[l]),
                ...selectedDifficulties.map((d) => reverseDifficultyMap[d]),
                ...(activeTab !== "open" ? [activeTab] : []),
              ]}
              multiple={true}
              showSelectAll={false}
              items={dropdownItems}
            />
          </div>
          <Tabs
            items={[
              {
                label: "Claimed",
                value: "claimed",
                className: "w-full md:!w-max",
                selected: activeTab === "claimed",
                onClick: () => setActiveTab("claimed"),
              },
              {
                label: "Completed",
                value: "completed",
                className: "w-full md:!w-max",
                selected: activeTab === "completed",
                onClick: () => setActiveTab("completed"),
              },
              {
                label: "Open",
                value: "open",
                className: "w-full md:!w-max order-first",
                selected: activeTab === "open",
                onClick: () => setActiveTab("open"),
              },
            ]}
            variant="segmented"
            className="hidden md:flex"
            theme="secondary"
          />
        </div>

        <div className="flex flex-col gap-y-8">
          {Object.entries(challengeSections).map(([language, section]) => {
            const languageChallenges = filteredChallenges
              .filter((challenge) => challenge.language === language)
              .sort((a, b) => {
                const statusOrder = { open: 0, completed: 1, claimed: 2 };
                const aStatus = challengeStatuses[a.slug] || "open";
                const bStatus = challengeStatuses[b.slug] || "open";
                return statusOrder[aStatus] - statusOrder[bStatus];
              });

            if (languageChallenges.length === 0) return null;

            return (
              <ChallengeSection
                key={language}
                language={language}
                section={section}
                challenges={languageChallenges}
                setIsNFTViewerOpen={setIsNFTViewerOpen}
                setSelectedChallenge={setSelectedChallenge}
                t={t}
                challengeStatuses={challengeStatuses}
              />
            );
          })}
        </div>
      </div>

      {hasNoResults && !isLoading && <ChallengesEmpty />}
    </div>
  );
}
