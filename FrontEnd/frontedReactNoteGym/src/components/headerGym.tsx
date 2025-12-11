export default function HeaderGym() {
  return (
    <header className="w-full h-20 bg-black flex items-center justify-center border-b border-gray-700">

      <div className="flex mx-auto justify-center items-center space-x-3">

        <h1 className="text-2xl font-bold text-white">
          <img 
          src="/logo.jpg"
          style={{
            borderRadius: "20%",
            marginRight: "15px"
          }}
          width={50} 
          height={50}
          alt="Logo NoteGym"
          className="w-10 h-10 object-contain"
        />NoteGym
        </h1>
        <hr />
      </div>

    </header>
  );
}
