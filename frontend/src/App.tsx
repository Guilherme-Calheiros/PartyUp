import { BrowserRouter, Route, Routes } from "react-router"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import ResetPasswordPage from "./pages/ResetPasswordPage"
import ProfilePage from "./pages/ProfilePage"
import ProtectedRoute from "./components/ProtectedRoute"
import GuestRoute from "./components/GuestRoute"
import ConditionalNavbar from "./components/nav/ConditionalNavBar"
import { AuthProvider } from "./contexts/AuthContext"
import AppLayout from "./components/layout/AppLayout"


function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex h-svh flex-col">
          <ConditionalNavbar />
          <main className="min-h-0 flex-1 pb-16 md:pb-0">
            <Routes>
              <Route element={<ProtectedRoute/>}>
                <Route element={<AppLayout />}>
                  <Route path="/inicio" element={<h1>Inicio</h1>} />
                  <Route path="/grupos" element={<h1>Grupos</h1>} />
                  <Route path="/agenda" element={<h1>Agenda</h1>} />
                  <Route path="/jogos" element={<h1>Jogos</h1>} />
                  <Route path="/perfil" element={<ProfilePage />} />
                </Route>
              </Route>
              <Route element={<GuestRoute/>}>
                <Route path="/" element={<h1>Hello, World!</h1>} />
                <Route path="/login" element={<LoginPage/>} />
                <Route path="/register" element={<RegisterPage/>} />
                <Route path="/reset-password" element={<ResetPasswordPage/>}/>
              </Route>
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
