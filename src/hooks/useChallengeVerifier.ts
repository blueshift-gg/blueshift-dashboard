import { useCallback, useEffect, useMemo, useState } from "react";
import { CourseMetadata } from "@/app/utils/course";
import { usePersistentStore } from "@/stores/store";
import { Certificate, TestResult } from "@/lib/challenges/types";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;

// --- Consolidated Types ---

export interface VerificationApiResponse {
  success: boolean;
  results: TestResult[];
  certificate?: Certificate;
}

export interface ChallengeRequirement {
  status: "passed" | "failed" | "incomplete";
  instructionKey: string;
}

// --- Hook Definition ---

interface useChallengeVerifierOptions {
  course: CourseMetadata;
}

interface UseChallengeVerifierReturn {
  verificationData: VerificationApiResponse | null;
  isLoading: boolean;
  error: string | null;
  uploadProgram: () => void;
  uploadTransaction: (base64EncodedTx: string) => Promise<void>;
  requirements: ChallengeRequirement[];
  setRequirements: React.Dispatch<React.SetStateAction<ChallengeRequirement[]>>;
  initialRequirements: ChallengeRequirement[];
  setVerificationData: React.Dispatch<
    React.SetStateAction<VerificationApiResponse | null>
  >;
  completedRequirementsCount: number;
  allIncomplete: boolean;
}

export function useChallengeVerifier({
  course,
}: useChallengeVerifierOptions): UseChallengeVerifierReturn {
  const [verificationData, setVerificationData] =
    useState<VerificationApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const verificationEndpoint = useMemo(() => {
    if (course.challenge) {
      return `${apiBaseUrl}${course.challenge.apiPath}`;
    }
    return undefined;
  }, [course.challenge]);

  const initialRequirements: ChallengeRequirement[] = useMemo(() => {
    return course.challenge
      ? course.challenge.requirements.map((req) => ({
          ...req,
          status: "incomplete" as const,
        }))
      : [];
  }, [course.challenge]);

  const [requirements, setRequirements] =
    useState<ChallengeRequirement[]>(initialRequirements);

  const { authToken, setCertificate } = usePersistentStore();

  useEffect(() => {
    // Sync requirements state if the initialRequirements array reference changes
    // (e.g. due to course.challenge changing if the course prop itself changes)
    setRequirements(initialRequirements);
  }, [initialRequirements]);

  useEffect(() => {
    if (verificationData && course.challenge) {
      setRequirements((prevRequirements) =>
        course.challenge!.requirements.map((req): ChallengeRequirement => {
          const result = verificationData.results?.find(
            (res) => res.instruction === req.instructionKey,
          );
          if (result) {
            return { ...req, status: result.success ? "passed" : "failed" };
          } else {
            const currentReq = prevRequirements.find(
              (r) => r.instructionKey === req.instructionKey,
            );
            return { ...req, status: currentReq?.status || "incomplete" };
          }
        }),
      );
    }
  }, [verificationData, course.challenge]);

  const handleVerificationRequest = useCallback(
    async (body: FormData | string, headers?: HeadersInit) => {
      if (!verificationEndpoint) {
        setIsLoading(false);
        setError("Challenge API path not configured for this course.");
        console.error(
          "handleVerificationRequest: Verification endpoint is not defined.",
        );
        return;
      }

      setIsLoading(true);
      setError(null);
      setVerificationData(null);

      try {
        const response = await fetch(verificationEndpoint, {
          method: "POST",
          body: body,
          ...(headers && { headers }),
          ...(authToken && {
            headers: {
              ...headers,
              Authorization: `Bearer ${authToken}`,
            },
          }),
        });

        if (response.ok) {
          const result: VerificationApiResponse = await response.json();
          setVerificationData(result);

          if (!result.success) {
            console.warn("Verification API reported failure:", result);
            return;
          }

          if (!result.certificate) {
            console.error("No certificate received in response.");
            setError("No certificate received.");
            return;
          }
          setCertificate(course.slug, result.certificate);
        } else {
          const errorText = await response.text();
          console.error(
            "Verification request failed:",
            response.statusText,
            errorText,
          );
          setError(
            `Verification failed: ${response.statusText} - ${errorText}`,
          );
          setVerificationData(null);
        }
      } catch (err) {
        console.error("Error verifying:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred.",
        );
        setVerificationData(null);
      } finally {
        setIsLoading(false);
      }
    },
    [verificationEndpoint, authToken, course.slug, setCertificate],
  );

  const uploadProgram = useCallback(async () => {
    if (!course.challenge || !verificationEndpoint) {
      setError(
        "Challenge or verification endpoint is not configured for this course.",
      );
      console.warn(
        "Upload program aborted: Challenge or verification endpoint not configured.",
      );
      return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".so";
    input.style.display = "none";

    input.onchange = async (event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      const canProceed = !!verificationEndpoint; // Re-check, ensure it's still valid

      if (!canProceed) {
        setError(
          "Verification endpoint became unavailable during file selection.",
        );
        console.error(
          "uploadProgram.onchange: Verification endpoint is not defined at time of file selection.",
        );
      }

      if (file && canProceed) {
        console.log("Selected file:", file.name);
        console.log("Sending verification request to:", verificationEndpoint); // verificationEndpoint is confirmed by canProceed
        const formData = new FormData();
        formData.append("program", file);
        await handleVerificationRequest(formData);
      }

      if (input.parentNode === document.body) {
        document.body.removeChild(input);
      }
    };

    document.body.appendChild(input);
    input.click();
  }, [
    course.challenge,
    verificationEndpoint,
    handleVerificationRequest,
    setError,
  ]);

  const uploadTransaction = useCallback(
    async (base64EncodedTx: string) => {
      if (!course.challenge || !verificationEndpoint) {
        console.error(
          "Transaction upload aborted: Challenge or verification endpoint is not configured.",
        );
        setError(
          "Challenge or verification endpoint is not configured for this course.",
        );
        return;
      }
      console.log(
        "Sending transaction verification request to:",
        verificationEndpoint,
      );
      await handleVerificationRequest(
        JSON.stringify({ transaction: base64EncodedTx }),
        { "Content-Type": "application/json" },
      );
    },
    [
      course.challenge,
      verificationEndpoint,
      handleVerificationRequest,
      setError,
    ],
  );

  const completedRequirementsCount = useMemo(() => {
    return requirements.filter((requirement) => requirement.status === "passed")
      .length;
  }, [requirements]);

  const allIncomplete = useMemo(() => {
    // Check if verificationData is null (initial state) OR if all requirements are 'incomplete'
    return (
      !verificationData ||
      requirements.every((requirement) => requirement.status === "incomplete")
    );
  }, [requirements, verificationData]);

  // --- Return combined state and functions ---
  return {
    verificationData,
    isLoading,
    error,
    uploadProgram,
    uploadTransaction,
    requirements,
    setRequirements,
    initialRequirements,
    setVerificationData,
    completedRequirementsCount,
    allIncomplete,
  };
}
