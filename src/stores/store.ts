import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CourseLanguages, courseLanguages } from "@/app/utils/course";
import { Certificate } from "@/lib/challenges/types";
import { challengeStatus, ChallengeStatus } from "@/app/utils/challenges";

export type ChallengeStatuses = "open" | "completed" | "claimed";

interface Store {
  // Global Modal
  openedModal: string | null;
  setOpenedModal: (modal: string | null) => void;
  closeModal: () => void;
  // Search
  searchValue: string;
  setSearchValue: (value: string) => void;
}

export const useStore = create<Store>()((set) => ({
  // Global Modal
  openedModal: null,
  setOpenedModal: (modal) => set({ openedModal: modal }),
  closeModal: () => set({ openedModal: null }),

  // Search
  searchValue: "",
  setSearchValue: (value) => set({ searchValue: value }),
}));

interface PersistentStore {
  // User's View Preference
  view: "grid" | "list";
  setView: (view: "grid" | "list") => void;

  // Course Progress
  courseProgress: Record<string, number>; // key: course slug, value: current lesson number
  setCourseProgress: (courseSlug: string, lessonNumber: number) => void;

  // Filters
  selectedLanguages: CourseLanguages[];
  toggleLanguage: (language: CourseLanguages) => void;
  clearLanguages: () => void;

  // Challenge Center
  selectedChallengeStatus: ReadonlyArray<ChallengeStatus>;
  toggleChallengeStatus: (status: ChallengeStatus) => void;
  clearChallengeStatus: () => void;

  // Wallet Recommended Modal
  connectionRecommendedViewed: boolean;
  setConnectionRecommendedViewed: (viewed: boolean) => void;

  // Authentication
  authToken: string | null;
  setAuthToken: (token: string) => void;
  clearAuthToken: () => void;

  // Certificates
  certificates: Record<string, Certificate>;
  setCertificate: (challengeSlug: string, certificate: Certificate) => void;

  // Challenge Statuses
  challengeStatuses: Record<string, ChallengeStatuses>;
  setChallengeStatus: (slug: string, status: ChallengeStatuses) => void;
  claimChallenges: (slugs: string[]) => void;

  // Auto-saved challenge code
  autoSavedCode: Record<string, string>;
  setAutoSavedCode: (challengeSlug: string, code: string) => void;
  clearAutoSavedCode: (challengeSlug: string) => void;
}

type V0PersistentStore = Omit<
  PersistentStore,
  "challengeStatuses" | "setNewChallengeStatus"
> & {
  courseStatus?: Record<string, "Locked" | "Unlocked" | "Claimed">;
};

type V1PersistentStore = Omit<PersistentStore, "selectedLanguages"> & {
  selectedLanguages: string[];
};

const migrate = (
  persistedState: unknown,
  version: number,
): Partial<PersistentStore> => {
  if (version === 0) {
    const oldState = persistedState as V0PersistentStore;
    const newChallengeStatuses: Record<string, ChallengeStatuses> = {};
    if (oldState.courseStatus) {
      for (const slug in oldState.courseStatus) {
        const courseSpecificStatus = oldState.courseStatus[slug];
        if (courseSpecificStatus === "Unlocked") {
          newChallengeStatuses[slug] = "completed";
        } else if (courseSpecificStatus === "Claimed") {
          newChallengeStatuses[slug] = "claimed";
        } else {
          newChallengeStatuses[slug] = "open";
        }
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { courseStatus, ...rest } = oldState;
    return { ...rest, challengeStatuses: newChallengeStatuses };
  }

  if (version === 1) {
    const oldState = persistedState as V1PersistentStore;
    // Migrate any "Research" language filters to "General"
    const migratedLanguages = oldState.selectedLanguages
      .map((lang) => (lang === "Research" ? "General" : lang))
      .filter((lang): lang is CourseLanguages =>
        Object.keys(courseLanguages).includes(lang as string),
      );

    return { ...oldState, selectedLanguages: migratedLanguages };
  }

  return persistedState as Partial<PersistentStore>;
};

export const usePersistentStore = create<PersistentStore>()(
  persist(
    (set) => ({
      // User's View Preference
      view: "grid",
      setView: (view) => set({ view }),

      // Course Progress
      courseProgress: {},
      setCourseProgress: (courseSlug, lessonNumber) =>
        set((state) => ({
          courseProgress: {
            ...state.courseProgress,
            [courseSlug]: lessonNumber,
          },
        })),

      // Filters
      selectedLanguages: Object.keys(courseLanguages) as CourseLanguages[],
      toggleLanguage: (language) =>
        set((state) => ({
          selectedLanguages: state.selectedLanguages.includes(language)
            ? state.selectedLanguages.filter((l) => l !== language)
            : [...state.selectedLanguages, language],
        })),
      clearLanguages: () => set({ selectedLanguages: [] }),

      // Challenge Center
      selectedChallengeStatus: challengeStatus,
      toggleChallengeStatus: (status) =>
        set((state) => ({
          selectedChallengeStatus: state.selectedChallengeStatus.includes(
            status,
          )
            ? state.selectedChallengeStatus.filter((s) => s !== status)
            : [...state.selectedChallengeStatus, status],
        })),
      clearChallengeStatus: () => set({ selectedChallengeStatus: [] }),

      // Wallet Connection Recommended Viewed
      connectionRecommendedViewed: false,
      setConnectionRecommendedViewed: (viewed) =>
        set({ connectionRecommendedViewed: viewed }),

      // Authentication
      authToken: null,
      setAuthToken: (token) => set({ authToken: token }),
      clearAuthToken: () => set({ authToken: null }),

      // Certificates
      certificates: {},
      setCertificate: (challengeSlug, certificate) =>
        set((state) => ({
          certificates: {
            ...state.certificates,
            [challengeSlug]: certificate,
          },
        })),

      challengeStatuses: {},
      setChallengeStatus: (slug, status) =>
        set((state) => ({
          challengeStatuses: { ...state.challengeStatuses, [slug]: status },
        })),
      claimChallenges: (slugs) =>
        set((state) => {
          const statusesToUpdate = Object.fromEntries(
            slugs.map((slug) => [slug, "claimed" as const]),
          );
          return {
            challengeStatuses: {
              ...state.challengeStatuses,
              ...statusesToUpdate,
            },
          };
        }),

      // Auto-saved challenge code
      autoSavedCode: {},
      setAutoSavedCode: (challengeSlug: string, code: string) =>
        set((state) => ({
          autoSavedCode: { ...state.autoSavedCode, [challengeSlug]: code },
        })),
      clearAutoSavedCode: (challengeSlug: string) =>
        set((state) => ({
          autoSavedCode: Object.keys(state.autoSavedCode).reduce(
            (acc, key) => {
              if (key !== challengeSlug) {
                acc[key] = state.autoSavedCode[key];
              }
              return acc;
            },
            {} as Record<string, string>,
          ),
        })),
    }),
    {
      name: "blueshift-storage",
      version: 2,
      migrate,
    },
  ),
);
