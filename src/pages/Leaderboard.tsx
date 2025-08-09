const Leaderboard = () => {
  document.title = "Leaderboard | MicroCTF";
  return (
    <main id="leaderboard" className="container py-10" aria-live="polite">
      <h1 className="font-display text-3xl mb-6">Leaderboard</h1>
      <p className="text-muted-foreground">Realtime board coming after Supabase connection.</p>
      <ul className="mt-6 space-y-2">
        {[1,2,3].map((i) => (
          <li key={i} className="rounded-md border bg-card p-4 flex items-center justify-between">
            <span className="font-mono">#{i} player{i}</span>
            <span className="font-mono">{(4-i)*100} pts</span>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Leaderboard;
