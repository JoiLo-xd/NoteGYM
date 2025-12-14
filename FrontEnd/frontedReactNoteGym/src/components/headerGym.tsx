export default function HeaderGym() {
  return (
    <header className="header">

      <div className="flex mx-auto justify-left items-left space-x-3 p-4">

        <h1 className="text-2xl font-bold text-white flex ">
          <img 
          src="/logo.jpg"
          style={{
            borderRadius: "20%",
            marginRight: "10px",
            marginTop: "20px",
            width: "80px",
            height: "80px",
          }}
          width={50} 
          height={40}
          alt="Logo NoteGym"
          className= "object-contain text-white  absolute left-6 top-12 -translate-y-1/2"
        />
         <span style={{color:"#d97641",fontSize:"60px",marginLeft:"18px",borderRadius:"15px",padding:"10px"}}>NoteGym</span>
        </h1>
        <hr />
      </div>

    </header>
  );
}
