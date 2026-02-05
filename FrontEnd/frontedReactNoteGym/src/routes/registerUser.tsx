import HeaderGym from "@/components/headerGym";

import RegisterNoteGym from "@/components/registerNoteGym";
export default function RegisterUser() {
  
  return (
    <div className="min-h-screen flex flex-col">
          <HeaderGym />
          <main className="flex-grow pt-24 px-4 py-10 flex justify-center overflow-auto">
            <RegisterNoteGym />
          </main>
        </div>
  );
}