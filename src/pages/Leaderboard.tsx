import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, ArrowLeft, Trophy, Medal, Star, TrendingUp,
  Flame, Target, Award,
} from "lucide-react";
import { useGamification } from "@/hooks/useGamification";
import { useBattles } from "@/hooks/useBattles";
import { useAuth } from "@/contexts/AuthContext";
import { Progress } from "@/components/ui/progress";

export default function Leaderboard() {
  const { user } = useAuth();
  const { profile, achievements, allAchievements } = useGamification();
  const { leaderboard, elo } = useBattles();

  const xpForNextLevel = ((profile?.level || 1) * 500);
  const xpProgress = profile ? ((profile.xp % 500) / 500) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link to="/dashboard" className="text-text-muted hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Sparkles className="w-6 h-6 text-primary" />
          <span className="font-display font-bold">Leaderboard & Achievements</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Player card */}
        {profile && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-8"
          >
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Star className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold">Level {profile.level}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={xpProgress} className="h-2 flex-1 max-w-xs" />
                  <span className="text-xs text-text-muted">
                    {profile.xp} / {xpForNextLevel} XP
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold flex items-center gap-1 justify-center">
                    <Flame className="w-5 h-5 text-orange-500" /> {profile.current_streak}
                  </p>
                  <p className="text-xs text-text-muted">Streak</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{profile.total_study_minutes}</p>
                  <p className="text-xs text-text-muted">Study Mins</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">{elo?.rating || 1200}</p>
                  <p className="text-xs text-text-muted">ELO</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Achievements */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Achievements
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {allAchievements.map((achievement) => {
                const earned = achievements.some(
                  (a: { achievement_id: string }) => a.achievement_id === achievement.id
                );
                return (
                  <div
                    key={achievement.id}
                    className={`glass-card p-4 text-center transition-opacity ${
                      earned ? "" : "opacity-40"
                    }`}
                  >
                    <span className="text-3xl">{achievement.icon}</span>
                    <h3 className="font-medium text-sm mt-2">{achievement.name}</h3>
                    <p className="text-xs text-text-muted mt-1">{achievement.description}</p>
                    <div className="flex items-center justify-center gap-1 mt-2">
                      <Star className="w-3 h-3 text-amber-500" />
                      <span className="text-xs font-medium">{achievement.xp_reward} XP</span>
                    </div>
                    <span
                      className="text-xs px-2 py-0.5 rounded-full mt-2 inline-block capitalize"
                      style={{
                        background:
                          achievement.rarity === "legendary"
                            ? "hsl(45 100% 50% / 0.1)"
                            : achievement.rarity === "epic"
                            ? "hsl(280 100% 60% / 0.1)"
                            : achievement.rarity === "rare"
                            ? "hsl(210 100% 60% / 0.1)"
                            : "hsl(var(--muted) / 0.3)",
                        color:
                          achievement.rarity === "legendary"
                            ? "hsl(45 100% 50%)"
                            : achievement.rarity === "epic"
                            ? "hsl(280 100% 60%)"
                            : achievement.rarity === "rare"
                            ? "hsl(210 100% 60%)"
                            : "hsl(var(--text-muted))",
                      }}
                    >
                      {achievement.rarity}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Leaderboard */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" /> Top Players
            </h2>
            <div className="glass-card overflow-hidden">
              <div className="divide-y divide-border/10">
                {leaderboard.slice(0, 20).map((entry, i) => (
                  <div
                    key={entry.id}
                    className={`flex items-center gap-4 px-4 py-3 ${
                      entry.user_id === user?.id ? "bg-primary/5" : ""
                    }`}
                  >
                    <span className="w-8 text-center font-bold text-sm">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {entry.user_id === user?.id ? "You" : `Player ${i + 1}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{entry.rating}</p>
                      <p className="text-xs text-text-muted">
                        {entry.wins}W / {entry.losses}L
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
