import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles, User, CreditCard, Bell, Shield, Trash2, LogOut, Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function Settings() {
  const { user, signOut } = useAuth();
  const { data: subscription, isPro } = useSubscription();
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "");
  const [notifications, setNotifications] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (error) throw error;
      await supabase
        .from("profiles")
        .update({ full_name: fullName, updated_at: new Date().toISOString() })
        .eq("id", user!.id);
      toast.success("Profile updated");
    } catch (err: unknown) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    toast.error("Account deletion requires admin approval. Contact support.");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" />
            <span className="font-display font-bold text-lg">SmartExam AI</span>
          </Link>
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8"
        >
          Settings
        </motion.h1>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" /> Profile</TabsTrigger>
            <TabsTrigger value="subscription"><CreditCard className="w-4 h-4 mr-2" /> Subscription</TabsTrigger>
            <TabsTrigger value="notifications"><Bell className="w-4 h-4 mr-2" /> Notifications</TabsTrigger>
            <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" /> Security</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="glass-card p-6 space-y-6">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email || ""} disabled className="mt-1" />
              </div>
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <Button onClick={handleSaveProfile} disabled={saving}>
                <Save className="w-4 h-4 mr-2" /> {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="subscription">
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-lg">Current Plan</h3>
                  <p className="text-text-muted capitalize">{subscription?.plan || "free"}</p>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    background: isPro ? "hsl(var(--primary) / 0.1)" : "hsl(var(--muted) / 0.3)",
                    color: isPro ? "hsl(var(--primary))" : "hsl(var(--text-muted))",
                  }}
                >
                  {subscription?.status || "active"}
                </span>
              </div>

              {subscription?.current_period_end && (
                <p className="text-sm text-text-muted">
                  Next billing: {new Date(subscription.current_period_end).toLocaleDateString()}
                </p>
              )}

              <div className="flex gap-3">
                <Link to="/pricing">
                  <Button variant={isPro ? "outline" : "default"}>
                    {isPro ? "Change Plan" : "Upgrade to Pro"}
                  </Button>
                </Link>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="glass-card p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Study Reminders</h3>
                  <p className="text-sm text-text-muted">Get notified about your study plan</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Achievement Alerts</h3>
                  <p className="text-sm text-text-muted">Notifications when you earn achievements</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Flashcard Reminders</h3>
                  <p className="text-sm text-text-muted">Remind when cards are due for review</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="glass-card p-6 space-y-6">
              <div>
                <h3 className="font-medium mb-2">Change Password</h3>
                <Button
                  variant="outline"
                  onClick={async () => {
                    if (!user?.email) return;
                    await supabase.auth.resetPasswordForEmail(user.email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    toast.success("Password reset email sent!");
                  }}
                >
                  Send Reset Link
                </Button>
              </div>
              <div className="pt-4 border-t border-border/30">
                <h3 className="font-medium text-destructive mb-2">Danger Zone</h3>
                <Button variant="destructive" onClick={handleDeleteAccount}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
