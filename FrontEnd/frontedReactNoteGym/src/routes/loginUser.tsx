import HeaderGym from "../components/headerGym";
import LoginNoteGym from "../components/loginNoteGym";

export default function LoginUser() {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderGym />
      <main className="flex-grow pt-24 flex items-center justify-center px-4 py-10">
        <LoginNoteGym />
      </main>
    </div>
  );
}
