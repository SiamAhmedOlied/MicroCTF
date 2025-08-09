import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";
import { gsap } from "gsap";

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(".hero-title", { y: 12, opacity: 0, duration: 0.6, ease: "power2.out" });
      gsap.from(".hero-sub", { y: 12, opacity: 0, duration: 0.6, delay: 0.1, ease: "power2.out" });
      gsap.from(".hero-cta", { y: 12, opacity: 0, duration: 0.6, delay: 0.2, stagger: 0.05, ease: "power2.out" });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground" ref={heroRef}>
      <header className="container flex items-center justify-between py-6">
        <a href="/" className="font-display text-2xl tracking-widest">MicroCTF</a>
        <div className="flex items-center gap-3">
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton>
              <Button variant="outline">Sign in</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

      <main className="container flex flex-col items-center justify-center text-center py-20">
        <h1 className="hero-title font-display text-5xl md:text-6xl font-semibold tracking-wider mb-4">
          MicroCTF — Dark Cyberpunk Mini CTF
        </h1>
        <p className="hero-sub max-w-2xl text-muted-foreground text-lg md:text-xl mb-8">
          Practice challenges across Web, Crypto, Reversing, Forensics, OSINT, Network, Stego and Misc with instant feedback and a realtime leaderboard.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a href="/challenges" className="hero-cta">
            <Button variant="neon">Explore Challenges</Button>
          </a>
          <a href="/leaderboard" className="hero-cta">
            <Button variant="secondary">Leaderboard</Button>
          </a>
        </div>
      </main>
    </div>
  );
};

export default Index;
