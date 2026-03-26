import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginUser from "./routes/loginUser";
import RegisterUser from "./routes/registerUser";
import ProtectedRoute from './routes/ProtectedRoute';
import DashboardRoute from './routes/DashboardRoute';
import Profile from './components/ProfileGym';
import DesbloqUsers from './components/admin/DesbloqUsers';
import ModUsers from './components/admin/ModUsers';
import RoutinesPage from './components/RoutinesPage';
import AdminRegisterGym from './components/admin/AdminRegisterGym';


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/loginUserGym" element={<LoginUser />} />
                <Route path="/newUserGym" element={<RegisterUser />} />
                <Route path="/" element={<LoginUser />} />

                <Route path="/dashboard" element={<DashboardRoute />} />
                <Route path='/profile' element={<Profile />} />
                <Route path='/rutinas' element={<RoutinesPage />} />

                <Route path="/admin/ModUsers" element={
                    <ProtectedRoute requiredRole="admin">
                        <ModUsers />
                    </ProtectedRoute>
                } />
                <Route path="/DesbloquearUsers" element={
                    <ProtectedRoute requiredRole="admin">
                        <DesbloqUsers />
                    </ProtectedRoute>
                } />
                <Route path="/admin/AddUser" element={
                    <ProtectedRoute requiredRole="admin">
                        <AdminRegisterGym />
                    </ProtectedRoute>
                } />
            </Routes>

        </BrowserRouter>
    )


}

export default App;
