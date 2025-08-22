import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { gsap } from "gsap";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth(); // This will auto-create profile when user signs in
  
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
      <main className="container flex flex-col items-center justify-center text-center py-20 min-h-screen">
        <h1 className="hero-title font-display text-5xl md:text-6xl font-semibold tracking-wider mb-4">
          MicroCTF — Dark Cyberpunk Mini CTF
        </h1>
        <p className="hero-sub max-w-2xl text-muted-foreground text-lg md:text-xl mb-8">
          Practice challenges across Web, Crypto, Reversing, Forensics, OSINT, Network, Stego and Misc with instant feedback and a realtime leaderboard.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link to="/challenges" className="hero-cta">
            <Button variant="neon">Explore Challenges</Button>
          </Link>
          <Link to="/leaderboard" className="hero-cta">
            <Button variant="secondary">Leaderboard</Button>
          </Link>
          <Link to="/contest" className="hero-cta">
            <Button variant="outline">Join Contest</Button>
          </Link>
        </div>
        
        {user && (
          <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg animate-fade-in">
            <p className="text-sm text-primary">
              Welcome back! Ready to solve some challenges? 🚀
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
