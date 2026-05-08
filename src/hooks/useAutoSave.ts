import { useEffect, useCallback, useRef, useState } from "react";
import { usePersistentStore } from "@/stores/store";

interface UseAutoSaveProps {
  challengeSlug: string;
  code: string;
  delay?: number;
}

type SaveState = "saved" | "unsaved" | "saving";

// Auto-save configuration constants
const DEFAULT_DEBOUNCE_DELAY = 1000; // 1 second
const JUST_SAVED_DISPLAY_DURATION = 2000; // 2 seconds
const LOADED_FROM_SAVE_DISPLAY_DURATION = 5000; // 5 seconds

/**
 * Custom hook for auto-saving challenge code with visual feedback
 *
 * @param challengeSlug - Unique identifier for the challenge
 * @param code - Current code content to auto-save
 * @param delay - Debounce delay in milliseconds (default: 1000ms)
 * @returns Object with save state, indicators, and control functions
 */
export function useAutoSave({
  challengeSlug,
  code,
  delay = DEFAULT_DEBOUNCE_DELAY,
}: UseAutoSaveProps) {
  const { autoSavedCode, setAutoSavedCode, clearAutoSavedCode } =
    usePersistentStore();

  // Refs for timeout management
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const justSavedTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loadedFromSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // State management
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [justSaved, setJustSaved] = useState(false);
  const [loadedFromAutoSave, setLoadedFromAutoSave] = useState(false);

  /**
   * Get auto-saved code for the current challenge
   */
  const getAutoSavedCode = useCallback(() => {
    return autoSavedCode[challengeSlug];
  }, [autoSavedCode, challengeSlug]);

  /**
   * Debounced auto-save function that saves code after inactivity
   */
  const debouncedSave = useCallback(() => {
    // Clear existing debounce timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Check if code has actually changed from what was last saved
    const currentSavedCode = autoSavedCode[challengeSlug] || "";
    const hasChanged = code !== currentSavedCode && code.trim() !== "";

    if (!hasChanged) {
      setSaveState("saved");
      return;
    }

    setSaveState("unsaved");

    debounceTimeoutRef.current = setTimeout(() => {
      if (code && code.trim() !== "") {
        setSaveState("saving");

        try {
          setAutoSavedCode(challengeSlug, code);

          // Show success state
          setSaveState("saved");
          setJustSaved(true);

          // Clear "just saved" indicator after delay
          if (justSavedTimeoutRef.current) {
            clearTimeout(justSavedTimeoutRef.current);
          }
          justSavedTimeoutRef.current = setTimeout(() => {
            setJustSaved(false);
          }, JUST_SAVED_DISPLAY_DURATION);
        } catch (error) {
          console.error("Failed to auto-save code:", error);
          setSaveState("saved"); // Reset to avoid stuck saving state
        }
      }
    }, delay);
  }, [challengeSlug, code, delay, setAutoSavedCode, autoSavedCode]);

  /**
   * Mark code as loaded from auto-save with temporary notification
   */
  const markAsLoadedFromAutoSave = useCallback(() => {
    setLoadedFromAutoSave(true);

    // Clear existing timeout
    if (loadedFromSaveTimeoutRef.current) {
      clearTimeout(loadedFromSaveTimeoutRef.current);
    }

    // Auto-hide the notification after delay
    loadedFromSaveTimeoutRef.current = setTimeout(() => {
      setLoadedFromAutoSave(false);
    }, LOADED_FROM_SAVE_DISPLAY_DURATION);
  }, []);

  /**
   * Clear the loaded from auto-save indicator
   */
  const clearLoadedFromAutoSave = useCallback(() => {
    if (loadedFromSaveTimeoutRef.current) {
      clearTimeout(loadedFromSaveTimeoutRef.current);
    }
    setLoadedFromAutoSave(false);
  }, []);

  /**
   * Clear all auto-saved code and reset state
   */
  const clearSavedCode = useCallback(() => {
    try {
      clearAutoSavedCode(challengeSlug);
      setSaveState("saved");
      setJustSaved(false);
      setLoadedFromAutoSave(false);

      // Clear all timeouts
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (justSavedTimeoutRef.current) {
        clearTimeout(justSavedTimeoutRef.current);
      }
      if (loadedFromSaveTimeoutRef.current) {
        clearTimeout(loadedFromSaveTimeoutRef.current);
      }
    } catch (error) {
      console.error("Failed to clear auto-saved code:", error);
    }
  }, [clearAutoSavedCode, challengeSlug]);

  // Auto-save whenever code changes
  useEffect(() => {
    debouncedSave();

    // Cleanup all timeouts on unmount or dependency change
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (justSavedTimeoutRef.current) {
        clearTimeout(justSavedTimeoutRef.current);
      }
      if (loadedFromSaveTimeoutRef.current) {
        clearTimeout(loadedFromSaveTimeoutRef.current);
      }
    };
  }, [debouncedSave]);

  return {
    getAutoSavedCode,
    clearSavedCode,
    hasAutoSavedCode: Boolean(autoSavedCode[challengeSlug]),
    saveState,
    justSaved,
    loadedFromAutoSave,
    markAsLoadedFromAutoSave,
    clearLoadedFromAutoSave,
  };
}
