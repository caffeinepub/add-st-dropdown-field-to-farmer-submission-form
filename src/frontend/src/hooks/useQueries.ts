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

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const _response = await fetch(GOOGLE_APPS_SCRIPT_WEB_APP_URL, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(payload),
          signal: controller.signal,
          redirect: "follow",
        });

        clearTimeout(timeoutId);
        return { success: true };
      } catch (error: any) {
        clearTimeout(timeoutId);

        if (error.name === "AbortError") {
          throw new Error("Connection Error");
        }

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

        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
    },
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

      const response = await actor.getLeaderboard();

      let data: unknown;
      try {
        data = JSON.parse(response);
      } catch {
        throw new Error(
          "Unable to parse leaderboard data. The backend returned invalid JSON.",
        );
      }

      // Expected format: { totalSubmissions: N, leaderboard: [{ loginID: string, submissions: N }] }
      let entries: unknown[] = [];

      if (Array.isArray(data)) {
        entries = data;
      } else if (typeof data === "object" && data !== null) {
        const obj = data as Record<string, unknown>;
        for (const key of [
          "leaderboard",
          "data",
          "entries",
          "results",
          "items",
        ]) {
          if (key in obj && Array.isArray(obj[key])) {
            entries = obj[key] as unknown[];
            break;
          }
        }
      }

      const validEntries = entries
        .map((entry: unknown) => {
          if (typeof entry !== "object" || entry === null) return null;
          const e = entry as Record<string, unknown>;

          // Support both loginID and loginId keys
          const loginId =
            e.loginId ?? e.loginID ?? e.login_id ?? e.id ?? e.userId;
          if (typeof loginId !== "string" || !loginId) return null;

          // Support both submissions and count keys
          const rawCount =
            e.submissions ??
            e.count ??
            e.entryCount ??
            e.submissionCount ??
            e.total;
          const count =
            typeof rawCount === "number" ? rawCount : Number(rawCount);
          if (Number.isNaN(count) || count < 0) return null;

          return { loginId, count };
        })
        .filter((e): e is { loginId: string; count: number } => e !== null);

      return validEntries
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map((entry, index) => ({
          loginId: entry.loginId,
          count: entry.count,
          rank: index + 1,
        }));
    },
    enabled: !!actor && !actorFetching,
    staleTime: 30000,
    refetchOnMount: true,
  });
}

// Derive submission count for a specific login ID from the leaderboard data
export function useGetSubmissionCount(loginId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ["submissionCount", loginId],
    queryFn: async () => {
      if (!loginId || !actor) return 0;

      const response = await actor.getLeaderboard();

      let data: unknown;
      try {
        data = JSON.parse(response);
      } catch {
        return 0;
      }

      let entries: unknown[] = [];

      if (Array.isArray(data)) {
        entries = data;
      } else if (typeof data === "object" && data !== null) {
        const obj = data as Record<string, unknown>;
        for (const key of [
          "leaderboard",
          "data",
          "entries",
          "results",
          "items",
        ]) {
          if (key in obj && Array.isArray(obj[key])) {
            entries = obj[key] as unknown[];
            break;
          }
        }
      }

      for (const entry of entries) {
        if (typeof entry !== "object" || entry === null) continue;
        const e = entry as Record<string, unknown>;
        const entryLoginId = String(e.loginId ?? e.loginID ?? e.login_id ?? "");
        if (entryLoginId === loginId) {
          const rawCount =
            e.submissions ??
            e.count ??
            e.entryCount ??
            e.submissionCount ??
            e.total;
          const count =
            typeof rawCount === "number" ? rawCount : Number(rawCount);
          return Number.isNaN(count) ? 0 : count;
        }
      }

      return 0;
    },
    enabled: !!loginId && !!actor && !actorFetching,
    staleTime: 30000,
    refetchOnMount: true,
  });
}
