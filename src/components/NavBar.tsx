import { Link, useLocation } from "@tanstack/react-router";
import { WalletButton } from "./WalletButton";

const links = [
  { to: "/", label: "Play" },
  { to: "/gallery", label: "Gallery" },
  { to: "/leaderboard", label: "Leaderboard" },
] as const;

export function NavBar() {
  const { pathname } = useLocation();
  return (
    <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4">
      <Link to="/" className="flex items-center gap-2">
        <div className="size-8 rounded-xl bg-brand shadow-[var(--shadow-glow)]" />
        <span className="font-bold text-lg tracking-tight">Press<span className="text-gradient">Start</span></span>
      </Link>
      <nav className="hidden sm:flex items-center gap-1 glass rounded-full px-1.5 py-1.5">
        {links.map((l) => {
          const active = pathname === l.to;
          return (
            <Link
              key={l.to}
              to={l.to}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${active ? "bg-brand text-primary-foreground" : "hover:bg-white/10"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <WalletButton />
    </header>
  );
}

export function MobileTabs() {
  const { pathname } = useLocation();
  return (
    <nav className="sm:hidden fixed bottom-4 left-4 right-4 z-40 glass-strong rounded-full flex items-center justify-around p-1.5">
      {links.map((l) => {
        const active = pathname === l.to;
        return (
          <Link
            key={l.to}
            to={l.to}
            className={`flex-1 text-center py-2 rounded-full text-sm font-medium transition ${active ? "bg-brand text-primary-foreground" : ""}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
