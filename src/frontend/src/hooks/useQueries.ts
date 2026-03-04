import { GOOGLE_APPS_SCRIPT_WEB_APP_URL } from "@/lib/googleAppsScript";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// Submit farmer data directly to Google Sheets
export function useSubmitFarmerData(loginId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      farmerName: string;
      mobileNumber: string;
      village: string | null;
      district: string;
      taluka: string;
      st: string;
      mgoHeadquarters: string;
      wheatVariety: string;
      crop1: string;
      crop2: string | null;
      irrigationType: string;
      totalAcreage: number;
    }) => {
      // Construct payload with explicit field order matching Google Apps Script expectations
      // loginID (capital ID) FIRST, name SECOND - critical for proper Google Sheets column order
      const payload = {
        loginID: loginId,
        name: data.farmerName,
        mobileNumber: data.mobileNumber,
        village: data.village || "",
        district: data.district,
        taluka: data.taluka,
        crop1: data.crop1,
        crop2: data.crop2 || "",
        irrigationType: data.irrigationType,
        totalAcreage: data.totalAcreage,
        ST: data.st || "",
        MGOHQ: data.mgoHeadquarters || "",
        WheatVariety: data.wheatVariety || "",
      };

      // Send POST request to Google Apps Script with timeout and proper error handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        const _response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
          method: "POST",
          mode: "no-cors", // Google Apps Script requires no-cors mode
          body: JSON.stringify(payload),
          signal: controller.signal,
          redirect: "follow",
        });

        clearTimeout(timeoutId);

        // CRITICAL: With no-cors mode, response.ok is always true and status is 0
        // This is expected behavior for Google Apps Script Web Apps
        // If we reach here without throwing, the request was sent successfully
        return { success: true };
      } catch (error: any) {
        clearTimeout(timeoutId);

        // Handle timeout errors - genuine connection issue
        if (error.name === "AbortError") {
          throw new Error("Connection Error");
        }

        // Handle network errors - genuine connection issues
        if (
          error.message?.includes("Failed to fetch") ||
          error.message?.includes("NetworkError") ||
          error.message?.includes("Network request failed") ||
          error.message?.includes("Load failed") ||
          error.message?.includes("net::ERR_") ||
          error.message?.includes("ECONNREFUSED") ||
          !navigator.onLine
        ) {
          throw new Error("Connection Error");
        }

        // Re-throw other errors
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate submission count and leaderboard to trigger refresh
      queryClient.invalidateQueries({ queryKey: ["submissionCount", loginId] });
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
  });
}

// Get submission count for a specific login ID via backend actor
export function useGetSubmissionCount(loginId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ["submissionCount", loginId],
    queryFn: async () => {
      if (!loginId || !actor) return 0;

      try {
        const response = await actor.getSubmissionCount(loginId);

        // Try to parse as JSON first
        let data: unknown;
        try {
          data = JSON.parse(response);
        } catch {
          // If not JSON, try to parse as plain text number
          const trimmed = response.trim();
          const parsed = Number.parseInt(trimmed, 10);
          if (!Number.isNaN(parsed) && parsed >= 0) {
            return parsed;
          }
          // If we can't parse it at all, throw to show "unavailable"
          throw new Error(
            "Unable to parse submission count from backend response",
          );
        }

        // Handle various JSON response shapes
        // Try common keys: count, entryCount, submissionCount, total
        if (typeof data === "number" && data >= 0) {
          return data;
        }

        if (typeof data === "object" && data !== null) {
          const obj = data as Record<string, unknown>;
          // Try different possible keys
          const possibleKeys = [
            "count",
            "entryCount",
            "submissionCount",
            "total",
            "value",
          ];
          for (const key of possibleKeys) {
            if (
              key in obj &&
              typeof obj[key] === "number" &&
              (obj[key] as number) >= 0
            ) {
              return obj[key] as number;
            }
          }

          // If we have a nested structure, try to find a count
          if (
            "data" in obj &&
            typeof obj.data === "object" &&
            obj.data !== null
          ) {
            const nested = obj.data as Record<string, unknown>;
            for (const key of possibleKeys) {
              if (
                key in nested &&
                typeof nested[key] === "number" &&
                (nested[key] as number) >= 0
              ) {
                return nested[key] as number;
              }
            }
          }
        }

        // If we got valid JSON but couldn't extract a count, return 0 as fallback
        console.warn("Submission count response has unexpected format:", data);
        return 0;
      } catch (error: any) {
        console.error("Failed to fetch submission count:", error);
        // Only throw for genuine errors (network, auth, etc.) to show "unavailable"
        throw error;
      }
    },
    enabled: !!loginId && !!actor && !actorFetching,
    staleTime: 0, // Always refetch when loginId changes
    refetchOnMount: true,
  });
}

// Leaderboard entry type
export interface LeaderboardEntry {
  loginId: string;
  count: number;
  rank: number;
}

// Get leaderboard data via backend actor
export function useGetLeaderboard() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      if (!actor) {
        throw new Error("Backend connection not available");
      }

      try {
        const response = await actor.getLeaderboard();

        // Parse the response string
        let data: unknown;
        try {
          data = JSON.parse(response);
        } catch (parseError) {
          console.error("JSON parse error:", parseError);
          throw new Error(
            "Unable to parse leaderboard data. The backend returned invalid JSON.",
          );
        }

        // Handle multiple valid response shapes
        let entries: unknown[] = [];

        // Case 1: Direct array
        if (Array.isArray(data)) {
          entries = data;
        }
        // Case 2: Object with leaderboard array
        else if (typeof data === "object" && data !== null) {
          const obj = data as Record<string, unknown>;
          // Try common keys for leaderboard data
          const possibleKeys = [
            "leaderboard",
            "data",
            "entries",
            "results",
            "items",
          ];
          for (const key of possibleKeys) {
            if (key in obj && Array.isArray(obj[key])) {
              entries = obj[key] as unknown[];
              break;
            }
          }

          // If no array found in common keys, check if it's a single-level object with nested data
          if (
            entries.length === 0 &&
            "data" in obj &&
            typeof obj.data === "object" &&
            obj.data !== null
          ) {
            const nested = obj.data as Record<string, unknown>;
            for (const key of possibleKeys) {
              if (key in nested && Array.isArray(nested[key])) {
                entries = nested[key] as unknown[];
                break;
              }
            }
          }
        }

        // Validate we got an array
        if (!Array.isArray(entries)) {
          console.error("Unexpected leaderboard format:", data);
          throw new Error(
            "The leaderboard data format is not supported. Expected an array of entries.",
          );
        }

        // Parse and validate entries
        // Each entry should have loginId and count (or similar fields)
        const validEntries = entries
          .map((entry: unknown) => {
            if (typeof entry !== "object" || entry === null) {
              return null;
            }
            const e = entry as Record<string, unknown>;

            // Extract loginId (try multiple possible keys)
            const loginId =
              e.loginId || e.loginID || e.login_id || e.id || e.userId;
            if (typeof loginId !== "string" || !loginId) {
              return null;
            }

            // Extract count (try multiple possible keys)
            let count = e.count;
            if (count === undefined) {
              count =
                e.entryCount ||
                e.submissionCount ||
                e.submissions ||
                e.total ||
                e.value;
            }

            // Ensure count is a valid number
            if (typeof count !== "number" || count < 0 || Number.isNaN(count)) {
              return null;
            }

            return {
              loginId,
              count,
            };
          })
          .filter(
            (entry): entry is { loginId: string; count: number } =>
              entry !== null,
          );

        // Sort by count descending and add ranks
        const sorted = validEntries
          .sort((a, b) => b.count - a.count)
          .slice(0, 10) // Top 10 only
          .map((entry, index) => ({
            loginId: entry.loginId,
            count: entry.count,
            rank: index + 1,
          }));

        return sorted;
      } catch (error: any) {
        console.error("Failed to fetch leaderboard:", error);
        // Preserve the error message for user-friendly display
        throw new Error(
          error.message ||
            "Failed to load leaderboard data. Please try again later.",
        );
      }
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000, // Cache for 30 seconds
    refetchOnMount: true,
  });
}
