import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Award, Medal, RefreshCw, Trophy } from "lucide-react";
import { useGetLeaderboard } from "../hooks/useQueries";

interface LeaderboardProps {
  onBack: () => void;
  currentLoginId: string;
}

export default function Leaderboard({
  onBack,
  currentLoginId,
}: LeaderboardProps) {
  const {
    data: leaderboard,
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useGetLeaderboard();

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeVariant = (rank: number) => {
    if (rank === 1) return "default";
    if (rank === 2 || rank === 3) return "secondary";
    return "outline";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to Form
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isRefetching}
          className="gap-2"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            <div>
              <CardTitle className="text-2xl font-display">
                Leaderboard
              </CardTitle>
              <CardDescription>
                Top 10 users by submission count
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="text-center py-12 text-muted-foreground">
              Loading leaderboard...
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error instanceof Error
                  ? error.message
                  : "Failed to load leaderboard. Please try again later."}
              </AlertDescription>
            </Alert>
          )}

          {!isLoading && !error && leaderboard && leaderboard.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              No submissions yet. Be the first to submit!
            </div>
          )}

          {!isLoading && !error && leaderboard && leaderboard.length > 0 && (
            <div className="space-y-3">
              {leaderboard.map((entry) => {
                const isCurrentUser = entry.loginId === currentLoginId;
                const isTopThree = entry.rank <= 3;

                return (
                  <div
                    key={entry.loginId}
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      isCurrentUser
                        ? "bg-primary/5 border-primary/20 ring-2 ring-primary/20"
                        : isTopThree
                          ? "bg-muted/50 border-muted"
                          : "bg-background border-border"
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(entry.rank) || (
                          <span className="text-2xl font-bold text-muted-foreground">
                            {entry.rank}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg">
                            Login ID: {entry.loginId}
                          </p>
                          {isCurrentUser && (
                            <Badge variant="default" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Rank #{entry.rank}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={getRankBadgeVariant(entry.rank)}
                        className="text-lg font-bold px-4 py-2"
                      >
                        {entry.count}{" "}
                        {entry.count === 1 ? "submission" : "submissions"}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
