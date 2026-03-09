import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, Sparkles, Zap, Crown, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    icon: Sparkles,
    color: "text-muted",
    features: [
      "5 document uploads",
      "20 AI questions/month",
      "30 chat messages/month",
      "50 flashcards",
      "Basic study tools",
    ],
    limitations: [
      "No exam battles",
      "No weakness radar",
      "No study planner",
      "No priority support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹299",
    period: "/month",
    icon: Zap,
    color: "text-primary",
    popular: true,
    features: [
      "100 document uploads",
      "500 AI questions/month",
      "1000 chat messages/month",
      "2000 flashcards",
      "AI Weakness Radar",
      "Predictive Score Engine",
      "Feynman Teaching Mode",
      "50 exam battles/month",
      "Smart Study Planner",
      "Knowledge Graph",
      "PYQ Analyzer",
      "Priority support",
    ],
    limitations: [],
  },
  {
    id: "university",
    name: "University",
    price: "₹999",
    period: "/month",
    icon: Crown,
    color: "text-amber-500",
    features: [
      "Unlimited everything",
      "All Pro features",
      "Team collaboration",
      "Admin dashboard",
      "Custom branding",
      "API access",
      "Dedicated support",
      "Analytics dashboard",
    ],
    limitations: [],
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const { data: subscription } = useSubscription();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      window.location.href = "/auth";
      return;
    }
    if (planId === "free") return;

    setLoading(planId);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: { planId },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      throw new Error("Checkout session did not return a URL.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to start checkout";
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/30 sticky top-0 z-50 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center">
          <Link to="/" className="flex items-center gap-2">
            <Sparkles className="w-7 h-7 text-primary" />
            <span className="font-display font-bold text-lg">SmartExam AI</span>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h1>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Choose the plan that fits your study needs. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className={`relative glass-card p-8 flex flex-col ${
                plan.popular ? "ring-2 ring-primary" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-xs font-semibold">
                  Most Popular
                </div>
              )}

              <div className="flex items-center gap-3 mb-4">
                <plan.icon className={`w-6 h-6 ${plan.color}`} />
                <h3 className="text-xl font-bold">{plan.name}</h3>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-text-muted">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
                {plan.limitations.map((l) => (
                  <li key={l} className="flex items-start gap-2 text-sm text-text-muted line-through">
                    <span className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{l}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id || subscription?.plan === plan.id}
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
              >
                {subscription?.plan === plan.id
                  ? "Current Plan"
                  : loading === plan.id
                  ? "Loading..."
                  : plan.id === "free"
                  ? "Get Started"
                  : "Start Free Trial"}
                {subscription?.plan !== plan.id && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
