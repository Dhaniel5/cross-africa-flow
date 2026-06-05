import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, CheckCircle2, Copy, Sparkles, RefreshCw } from "lucide-react";

const NAME_RE = /^[\p{L} .'-]+$/u;
const PHONE_RE = /^[+\d\s()-]+$/;
const EMAIL_RE = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/i;

const schema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(100, "Name is too long")
    .regex(NAME_RE, "Name contains invalid characters"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(PHONE_RE, "Only digits and + - ( ) allowed")
    .refine((v) => v.replace(/\D/g, "").length >= 7, "Phone needs at least 7 digits"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(255, "Email is too long")
    .regex(EMAIL_RE, "Enter a valid email"),
  country: z.enum(["Nigeria", "Ghana", "Other"]),
  user_type: z.enum(["Student", "Freelancer", "Business Owner", "POS Agent", "Other"]),
  pain_point: z
    .string()
    .trim()
    .min(10, "Please share at least a sentence (10+ characters)")
    .max(500, "Keep it under 500 characters"),
});

function makeChallenge() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

type SuccessState = { referralCode: string };

export function WaitlistForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<SuccessState | null>(null);
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    country: "" as "" | "Nigeria" | "Ghana" | "Other",
    user_type: "" as "" | "Student" | "Freelancer" | "Business Owner" | "POS Agent" | "Other",
    pain_point: "",
  });
  const [challenge, setChallenge] = useState<{ a: number; b: number; answer: number } | null>(null);
  const [captcha, setCaptcha] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [hp, setHp] = useState(""); // honeypot

  useEffect(() => {
    setChallenge(makeChallenge());
    setStartedAt(Date.now());
  }, []);

  const refreshChallenge = () => {
    setChallenge(makeChallenge());
    setCaptcha("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot: silently reject bots that fill hidden field
    if (hp.trim() !== "") {
      toast.success("You're on the list!");
      return;
    }
    // Time trap: reject submissions faster than 2s
    if (!startedAt || Date.now() - startedAt < 2000) {
      toast.error("Please take a moment to review your answers.");
      return;
    }
    // CAPTCHA
    if (!challenge || Number(captcha) !== challenge.answer) {
      toast.error("Captcha is incorrect. Please try again.");
      refreshChallenge();
      return;
    }

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check your inputs");
      return;
    }
    setLoading(true);
    try {
      const referredBy =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("ref")
          : null;

      const { data, error } = await supabase.rpc("submit_waitlist_signup", {
        _full_name: parsed.data.full_name,
        _phone: parsed.data.phone,
        _email: parsed.data.email,
        _country: parsed.data.country,
        _user_type: parsed.data.user_type,
        _pain_point: parsed.data.pain_point,
        _referred_by: referredBy ?? undefined,
      });

      if (error) {
        if (error.code === "23505") {
          toast.error("This email is already on the waitlist.");
        } else {
          toast.error("Something went wrong. Please try again.");
        }
        refreshChallenge();
        return;
      }
      setSuccess({ referralCode: data as string });
      toast.success("You're on the list!");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    const link =
      typeof window !== "undefined"
        ? `${window.location.origin}/?ref=${success.referralCode}`
        : "";
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-elegant animate-fade-up">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h3 className="text-2xl font-semibold">You're a Founding Member</h3>
        <p className="mt-2 text-muted-foreground">
          Check your inbox soon. Invite 3 friends to unlock priority early access.
        </p>
        <div className="mt-6 rounded-xl border bg-muted/40 p-4 text-left">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Your referral link
          </Label>
          <div className="mt-2 flex items-center gap-2">
            <code className="flex-1 truncate rounded-md bg-background px-3 py-2 text-sm">
              {link}
            </code>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(link);
                toast.success("Copied to clipboard");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-[color:var(--accent-yellow)]" />
          Early features, priority access, and exclusive benefits await.
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border bg-card p-6 shadow-elegant sm:p-8"
    >
      <div className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="full_name">Full name</Label>
          <Input
            id="full_name"
            placeholder="Ada Lovelace"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone (WhatsApp preferred)</Label>
            <Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="+234 800 000 0000"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="grid gap-2">
            <Label>Country</Label>
            <Select
              value={form.country}
              onValueChange={(v) => setForm({ ...form, country: v as typeof form.country })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Nigeria">Nigeria</SelectItem>
                <SelectItem value="Ghana">Ghana</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>I am a…</Label>
            <Select
              value={form.user_type}
              onValueChange={(v) =>
                setForm({ ...form, user_type: v as typeof form.user_type })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select user type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Freelancer">Freelancer</SelectItem>
                <SelectItem value="Business Owner">Business Owner</SelectItem>
                <SelectItem value="POS Agent">POS Agent</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="pain_point">
            What's your biggest problem with current banking apps?{" "}
            <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="pain_point"
            placeholder="Failed transfers, slow settlement, high FX fees…"
            rows={3}
            required
            minLength={10}
            maxLength={500}
            value={form.pain_point}
            onChange={(e) => setForm({ ...form, pain_point: e.target.value })}
          />
        </div>

        {/* Honeypot — hidden from humans, bots fill it */}
        <div className="hidden" aria-hidden="true">
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={hp}
            onChange={(e) => setHp(e.target.value)}
          />
        </div>

        {/* Lightweight math CAPTCHA */}
        <div className="grid gap-2">
          <Label htmlFor="captcha">
            Quick check: what is{" "}
            <span className="font-semibold text-foreground">
              {challenge.a} + {challenge.b}
            </span>
            ? <span className="text-destructive">*</span>
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="captcha"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Your answer"
              value={captcha}
              onChange={(e) => setCaptcha(e.target.value.replace(/\D/g, "").slice(0, 3))}
              required
              className="max-w-[160px]"
            />
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={refreshChallenge}
              aria-label="New question"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="h-12 w-full bg-[image:var(--gradient-brand)] text-base font-semibold shadow-glow hover:opacity-95"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Joining…
            </>
          ) : (
            "Join Early Access"
          )}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          We'll only contact you about SOW early access. No spam.
        </p>
      </div>
    </form>
  );
}
