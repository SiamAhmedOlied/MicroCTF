import { Button } from "@/components/ui/button";

const Challenges = () => {
  document.title = "Challenges | MicroCTF";
  return (
    <main className="container py-10">
      <h1 className="font-display text-3xl mb-6">Challenges</h1>
      <p className="text-muted-foreground mb-6">Browse categories and pick a challenge to start.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["Web","Crypto","Reverse","Forensics","OSINT","Network","Stego","Misc"].map((c) => (
          <div key={c} className="rounded-lg border bg-card p-5 hover:shadow-[var(--shadow-elegant)] transition-shadow">
            <h2 className="font-display text-xl mb-2">{c}</h2>
            <p className="text-sm text-muted-foreground mb-4">Sample challenges coming soon.</p>
            <Button variant="neon">View {c}</Button>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Challenges;
