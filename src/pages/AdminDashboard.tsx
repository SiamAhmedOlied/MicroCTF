import { SignedIn, SignedOut, useUser } from "@clerk/clerk-react";

const AdminDashboard = () => {
  const { user } = useUser();
  const isAdmin = Boolean(user?.publicMetadata?.isAdmin);
  document.title = "Admin | MicroCTF";
  return (
    <main className="container py-10">
      <h1 className="font-display text-3xl mb-6">Admin</h1>
      <SignedOut>
        <div className="rounded-md border bg-card p-6">Sign in to access the admin panel.</div>
      </SignedOut>
      <SignedIn>
        {isAdmin ? (
          <div className="rounded-md border bg-card p-6">
            <p className="text-muted-foreground">Challenge CRUD will appear here after Supabase is connected.</p>
          </div>
        ) : (
          <div className="rounded-md border bg-card p-6">You don’t have admin access.</div>
        )}
      </SignedIn>
    </main>
  );
};

export default AdminDashboard;
