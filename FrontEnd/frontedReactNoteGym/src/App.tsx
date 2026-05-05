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
import TrainPage from './components/TrainPage';
import ForumPage from './components/ForumPage';
import TrainerPage from './components/trainer/TrainerPage';
import { SnackProvider } from './components/SnackProvider';


function App() {
    return (
        <BrowserRouter>
            <SnackProvider>
                <Routes>
                    <Route path="/loginUserGym" element={<LoginUser />} />
                    <Route path="/newUserGym" element={<RegisterUser />} />
                    <Route path="/" element={<LoginUser />} />

                    <Route path="/dashboard" element={<DashboardRoute />} />
                    <Route path='/profile' element={<Profile />} />
                    <Route path='/rutinas' element={<RoutinesPage />} />
                    <Route path='/entrenar' element={<TrainPage />} />
                    <Route path='/comunidad' element={<ForumPage />} />

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
                    <Route path="/trainer" element={
                        <ProtectedRoute requiredRole="trainer">
                            <TrainerPage />
                        </ProtectedRoute>
                    } />
                </Routes>
            </SnackProvider>
        </BrowserRouter>
    )


}

export default App;
