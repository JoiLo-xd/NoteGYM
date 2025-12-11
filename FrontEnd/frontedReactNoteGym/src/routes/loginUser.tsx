import HeaderGym from "../components/headerGym";
import LoginNoteGym from "../components/loginNoteGym";

export default function LoginUser() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderGym />
      <main className="flex-grow flex items-center justify-center p-4">
        <LoginNoteGym />
      </main>
    </div>
  );
}
