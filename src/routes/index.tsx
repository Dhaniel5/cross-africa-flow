import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { WaitlistForm } from "@/components/WaitlistForm";
import { WaitlistCounter } from "@/components/WaitlistCounter";
import {
  AlertTriangle,
  Clock,
  TrendingDown,
  Globe2,
  ShieldCheck,
  Zap,
  Sparkles,
  Mail,
} from "lucide-react";
import sowLogo from "@/assets/sow-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOW — Move money across Africa without stress" },
      {
        name: "description",
        content:
          "Join the SOW waitlist for early access to a faster, simpler way to send and receive money across Africa.",
      },
      { property: "og:title", content: "SOW — Move money across Africa without stress" },
      {
        property: "og:description",
        content:
          "Early access to a new financial layer for Nigeria, Ghana and beyond. No failed transfers. No banking delays.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
      {
        rel: "preconnect",
        href: "https://fonts.googleapis.com",
      },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Sora:wght@500;600;700;800&family=Inter:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster richColors position="top-center" />

      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <a href="#top" className="flex items-center gap-2">
            <img src={sowLogo} alt="SOW logo" className="h-9 w-9 rounded-lg" />
            <span className="font-display text-xl font-bold tracking-tight">SOW</span>
          </a>
          <a
            href="#waitlist"
            className="inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Join waitlist
          </a>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-hero-glow" />
        <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:grid lg:grid-cols-2 lg:gap-12 lg:pb-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--accent-yellow)]" />
              Early access — Nigeria & Ghana
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
              Move money across <span className="text-gradient">Africa</span> without stress.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Join the SOW waitlist for early access to a faster, simpler way to send and
              receive money — without failed transfers or banking delays.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a
                href="#waitlist"
                className="inline-flex h-12 items-center justify-center rounded-full bg-[image:var(--gradient-brand)] px-7 text-sm font-semibold text-primary-foreground shadow-glow transition hover:opacity-95"
              >
                Join Early Access
              </a>
              <a
                href="#problem"
                className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-card px-7 text-sm font-semibold transition hover:bg-accent"
              >
                See why
              </a>
            </div>
            <div className="mt-8">
              <WaitlistCounter />
            </div>
          </div>

          <div className="relative mt-12 flex items-center justify-center lg:mt-0">
            <div className="relative">
              <div className="absolute -inset-10 rounded-full bg-[image:var(--gradient-accent)] opacity-20 blur-3xl" />
              <img
                src={sowLogo}
                alt="SOW"
                className="relative h-64 w-64 animate-float rounded-3xl shadow-elegant sm:h-80 sm:w-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section id="problem" className="border-t border-border/60 bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Banking in Africa is broken. You feel it every day.
            </h2>
            <p className="mt-4 text-muted-foreground">
              We've all been there — debited but the recipient never got paid. Waiting hours
              for a transfer to land. Losing money to bad FX rates.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: AlertTriangle, title: "Failed bank transfers", desc: "Money debited, no receipt, no answers." },
              { icon: Clock, title: "Slow settlement", desc: "Hours, sometimes days, to clear a payment." },
              { icon: TrendingDown, title: "Poor FX rates", desc: "Hidden margins eating into every dollar." },
              { icon: Globe2, title: "Cross-border friction", desc: "Sending across borders feels impossible." },
            ].map((p) => (
              <div
                key={p.title}
                className="rounded-2xl border bg-card p-5 transition hover:shadow-elegant"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:grid lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              The SOW way
            </span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              A new financial layer, built for Africa.
            </h2>
            <p className="mt-4 text-muted-foreground">
              SOW helps you move money easily across African countries with speed,
              transparency, and trust — designed for how you actually live and work.
            </p>
          </div>
          <div className="mt-10 grid gap-4 lg:col-span-3 lg:mt-0 sm:grid-cols-3">
            {[
              { icon: Zap, title: "Instant", desc: "Money moves in seconds — not hours." },
              { icon: ShieldCheck, title: "Transparent", desc: "Real rates, zero hidden fees." },
              { icon: Globe2, title: "Cross-border", desc: "NGN, GHS and more — one app." },
            ].map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border bg-card p-6 shadow-sm transition hover:shadow-elegant"
              >
                <s.icon className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section
        id="waitlist"
        className="border-t border-border/60 bg-gradient-to-b from-muted/30 to-background py-20"
      >
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Reserve your spot</h2>
            <p className="mt-3 text-muted-foreground">
              Be first in line. Founding Members get priority access, early features, and
              exclusive benefits.
            </p>
          </div>
          <WaitlistForm />
        </div>
      </section>

      {/* Incentive */}
      <section className="py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="rounded-3xl border bg-[image:var(--gradient-brand)] p-10 text-primary-foreground shadow-elegant">
            <Sparkles className="mx-auto h-8 w-8 text-[color:var(--accent-yellow)]" />
            <h3 className="mt-4 text-2xl font-bold sm:text-3xl">
              Become a Founding Member of SOW
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-primary-foreground/85">
              Early users help shape the product and unlock perks reserved for the first
              wave — for life.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <img src={sowLogo} alt="" className="h-6 w-6 rounded-md" />
            <span>© {new Date().getFullYear()} SOW</span>
          </div>
          <nav className="flex items-center gap-6">
            <a href="#top" className="hover:text-foreground">About</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="mailto:sowglobal6@gmail.com" className="inline-flex items-center gap-1.5 hover:text-foreground">
              <Mail className="h-3.5 w-3.5" />
              sowglobal6@gmail.com
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
