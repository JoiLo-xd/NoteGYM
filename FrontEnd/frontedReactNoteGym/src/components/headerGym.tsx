export default function HeaderGym() {
  return (
    <header className="w-full h-20 px-6 bg-black flex items-center border-b border-gray-700">

      <div className="flex items-center space-x-3">
        <img 
          src="/logo.jpg"
          alt="Logo NoteGym"
          className="w-10 h-10 object-contain"
        />

        <h1 className="text-2xl font-bold text-white">
          NoteGym
        </h1>
      </div>

    </header>
  );
}
