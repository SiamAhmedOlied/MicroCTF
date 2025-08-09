import { SignedIn, SignedOut, SignInButton, UserProfile } from "@clerk/clerk-react";

const Profile = () => {
  document.title = "Profile | MicroCTF";
  return (
    <main className="container py-10">
      <h1 className="font-display text-3xl mb-6">Your Profile</h1>
      <SignedOut>
        <div className="rounded-md border bg-card p-6">
          <p className="mb-4">Please sign in to view your profile.</p>
          <SignInButton />
        </div>
      </SignedOut>
      <SignedIn>
        <div className="rounded-md border bg-card p-6">
          <UserProfile />
        </div>
      </SignedIn>
    </main>
  );
};

export default Profile;
