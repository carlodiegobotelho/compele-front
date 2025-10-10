import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import Login from './pages/Login'
import Principal from './pages/Principal'
import SolicitarReserva from './pages/SolicitarReserva'
import Pendencias from './pages/Pendencias'
import MinhasSolicitacoes from './pages/MinhasSolicitacoes'
import Sidebar from './components/Sidebar'

export default function App() {
  const navigate = useNavigate()
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  useEffect(() => {
    const token = localStorage.getItem('Compele-ChaveAcesso')
    if (!token && !isLoginPage) {
      navigate('/login')
    }
  }, [navigate, isLoginPage])

 return (
    <div className={`${!isLoginPage ? 'app-layout' : ''}`}>
      {!isLoginPage && <Sidebar />}
      <div className={`page-content ${!isLoginPage ? 'with-sidebar' : ''}`}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/principal" element={<Principal />} />
          <Route path="/solicitar-reserva" element={<SolicitarReserva />} />
          <Route path="/minhas-pendencias" element={<Pendencias />} />
          <Route path="/minhas-solicitacoes" element={<MinhasSolicitacoes />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  )
}
