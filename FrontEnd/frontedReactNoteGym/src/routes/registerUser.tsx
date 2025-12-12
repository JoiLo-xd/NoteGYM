import HeaderGym from "@/components/headerGym";

import RegisterNoteGym from "@/components/registerNoteGym";
export default function RegisterUser() {
  
  return (
    <div className="min-h-screen flex flex-col">
          <HeaderGym />
          <main className="flex-grow flex items-center justify-center p-4">
            <RegisterNoteGym />
          </main>
        </div>
  );
}