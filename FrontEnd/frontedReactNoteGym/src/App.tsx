import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginUser from "./routes/loginUser";
import RegisterUser from "./routes/registerUser";
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardRoute from './routes/DashboardRoute';
import ProfileGym from './components/ProfileGym';


function App() {
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/loginUserGym" element={<LoginUser />} />    //(LoginUser)nombre de las funcion que crearemos dentro de la carpeta routes dentro del file loginUser
                <Route path="/newUserGym" element={<RegisterUser />} />   //(RegisterUser)nombre de las funcion que crearemos dentro de la carpeta routes dentro del file registerUser
                <Route path="/" element={<LoginUser />} />

                <Route path="/dashboard" element={<DashboardRoute />} />
                <Route path='/profile' element={<ProfileGym />} />
            </Routes>

        </BrowserRouter>
        )


}

export default App;
