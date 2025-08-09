import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
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
        <h1 className="font-display text-5xl md:text-6xl font-semibold tracking-wider mb-4">
          MicroCTF — Dark Cyberpunk Mini CTF
        </h1>
        <p className="max-w-2xl text-muted-foreground text-lg md:text-xl mb-8">
          Practice challenges across Web, Crypto, Reversing, Forensics, OSINT, Network, Stego and Misc with instant feedback and a realtime leaderboard.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button className="">Explore Challenges</Button>
          <a href="#leaderboard">
            <Button variant="secondary">Leaderboard</Button>
          </a>
        </div>
      </main>
    </div>
  );
};

export default Index;
