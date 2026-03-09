import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowLeft, Swords, Trophy, Loader2, Users, Clock, Zap,
  Shield, Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBattles } from "@/hooks/useBattles";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const modeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  speed: Zap,
  endurance: Shield,
  sudden_death: Crown,
};

export default function Battles() {
  const { user } = useAuth();
  const { battles, elo, leaderboard, createBattle, joinBattle, isLoading } = useBattles();
  const [selectedDoc, setSelectedDoc] = useState("");
  const [selectedMode, setSelectedMode] = useState("speed");
  const [tab, setTab] = useState<"lobby" | "history" | "leaderboard">("lobby");

  const documentsQuery = useQuery({
    queryKey: ["documents-for-battle", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("id, title")
        .eq("user_id", user!.id)
        .eq("status", "ready");
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const waitingBattles = battles.filter((b) => b.status === "waiting" && b.host_id !== user?.id);

  const handleCreate = async () => {
    if (!selectedDoc) {
      toast.error("Select a document first");
      return;
    }
    try {
      await createBattle.mutateAsync({ documentId: selectedDoc, mode: selectedMode });
      toast.success("Battle room created! Waiting for opponent...");
    } catch {
      toast.error("Failed to create battle");
    }
  };

  const handleJoin = async (roomId: string) => {
    try {
      await joinBattle.mutateAsync(roomId);
      toast.success("Joined battle!");
    } catch {
      toast.error("Failed to join battle");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-text-muted hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-display font-bold">Exam Battles</span>
          {elo && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10">
              <Trophy className="w-4 h-4 text-primary" />
              <span className="font-semibold text-sm">{elo.rating}</span>
              <span className="text-xs text-text-muted">ELO</span>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {(["lobby", "history", "leaderboard"] as const).map((t) => (
            <Button
              key={t}
              variant={tab === t ? "default" : "outline"}
              size="sm"
              onClick={() => setTab(t)}
              className="capitalize"
            >
              {t === "lobby" && <Swords className="w-4 h-4 mr-1" />}
              {t === "history" && <Clock className="w-4 h-4 mr-1" />}
              {t === "leaderboard" && <Trophy className="w-4 h-4 mr-1" />}
              {t}
            </Button>
          ))}
        </div>

        {tab === "lobby" && (
          <>
            {/* Create battle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6 mb-8"
            >
              <h2 className="text-lg font-semibold mb-4">Create Battle</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <select
                  value={selectedDoc}
                  onChange={(e) => setSelectedDoc(e.target.value)}
                  className="px-3 py-2 rounded-lg bg-background border border-border text-sm"
                >
                  <option value="">Select document...</option>
                  {documentsQuery.data?.map((doc) => (
                    <option key={doc.id} value={doc.id}>{doc.title}</option>
                  ))}
                </select>

                <div className="flex gap-2">
                  {["speed", "endurance", "sudden_death"].map((mode) => {
                    const Icon = modeIcons[mode];
                    return (
                      <Button
                        key={mode}
                        variant={selectedMode === mode ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedMode(mode)}
                        className="flex-1"
                      >
                        <Icon className="w-4 h-4 mr-1" />
                        <span className="capitalize text-xs">{mode.replace("_", " ")}</span>
                      </Button>
                    );
                  })}
                </div>

                <Button onClick={handleCreate} disabled={createBattle.isPending}>
                  {createBattle.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <><Swords className="w-4 h-4 mr-2" /> Create</>
                  )}
                </Button>
              </div>
            </motion.div>

            {/* Open rooms */}
            <h2 className="text-lg font-semibold mb-4">Open Rooms</h2>
            {waitingBattles.length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Users className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No open battles. Create one to get started!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {waitingBattles.map((battle) => (
                  <div key={battle.id} className="glass-card p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="capitalize text-sm font-medium">{battle.mode.replace("_", " ")}</span>
                      <span className="text-xs text-text-muted">
                        {new Date(battle.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <Button size="sm" onClick={() => handleJoin(battle.id)} className="w-full">
                      <Swords className="w-4 h-4 mr-2" /> Join Battle
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "history" && (
          <div className="space-y-3">
            {battles.filter((b) => b.status === "completed").length === 0 ? (
              <div className="glass-card p-8 text-center">
                <Clock className="w-10 h-10 text-text-muted mx-auto mb-3" />
                <p className="text-text-muted">No completed battles yet</p>
              </div>
            ) : (
              battles
                .filter((b) => b.status === "completed")
                .map((battle) => {
                  const isHost = battle.host_id === user?.id;
                  const won = battle.winner_id === user?.id;
                  const myScore = isHost ? battle.host_score : battle.opponent_score;
                  const theirScore = isHost ? battle.opponent_score : battle.host_score;

                  return (
                    <div key={battle.id} className="glass-card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            won ? "bg-green-500/10" : "bg-destructive/10"
                          }`}
                        >
                          {won ? (
                            <Trophy className="w-5 h-5 text-green-500" />
                          ) : (
                            <Swords className="w-5 h-5 text-destructive" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {won ? "Victory" : "Defeat"} — {battle.mode.replace("_", " ")}
                          </p>
                          <p className="text-xs text-text-muted">
                            {new Date(battle.ended_at || battle.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{myScore} — {theirScore}</p>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {tab === "leaderboard" && (
          <div className="glass-card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left p-4 text-sm font-medium text-text-muted">#</th>
                  <th className="text-left p-4 text-sm font-medium text-text-muted">Player</th>
                  <th className="text-right p-4 text-sm font-medium text-text-muted">Rating</th>
                  <th className="text-right p-4 text-sm font-medium text-text-muted">W/L</th>
                  <th className="text-right p-4 text-sm font-medium text-text-muted">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, i) => (
                  <tr
                    key={entry.id}
                    className={`border-b border-border/10 ${
                      entry.user_id === user?.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <td className="p-4 text-sm font-medium">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                    </td>
                    <td className="p-4 text-sm">
                      {entry.user_id === user?.id ? "You" : `Player ${i + 1}`}
                    </td>
                    <td className="p-4 text-sm text-right font-bold">{entry.rating}</td>
                    <td className="p-4 text-sm text-right">
                      <span className="text-green-500">{entry.wins}</span>
                      /
                      <span className="text-destructive">{entry.losses}</span>
                    </td>
                    <td className="p-4 text-sm text-right">{entry.streak} 🔥</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
