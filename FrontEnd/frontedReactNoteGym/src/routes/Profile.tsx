import HeaderGym from "../components/headerGym";
import ProfileGym from "../components/ProfileGym";

export default function Profile() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderGym />
      <main className="flex-grow flex items-center justify-center p-4">
        <ProfileGym />
      </main>
    </div>
  );
}
