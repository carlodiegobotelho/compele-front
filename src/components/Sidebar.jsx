import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  FaHome,
  FaPlus,
  FaTasks,
  FaSignOutAlt,
  FaBars,
  FaChevronLeft,
  FaUserCircle,
} from 'react-icons/fa'
import '../styles/Sidebar.css'

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [usuario, setUsuario] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const token = localStorage.getItem('Compele-ChaveAcesso')
    const userData = localStorage.getItem('Compele-DadosUsuario')
    if (token && userData) {
      setUsuario(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('Compele-ChaveAcesso')
    localStorage.removeItem('Compele-DadosUsuario')
    navigate('/login')
  }

  const menuItems = [
    { name: 'Principal', icon: <FaHome />, path: '/principal' },
    { name: 'Solicitar Reserva', icon: <FaPlus />, path: '/solicitar-reserva' },
    { name: 'Minhas Pendências', icon: <FaTasks />, path: '/minhas-pendencias' },
  ]

  return (
    <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {isCollapsed ? (
          <button className="toggle-btn-closed" onClick={() => setIsCollapsed(false)}>
            <FaBars />
          </button>
        ) : (
          <>
            <div className="user-section">
              <FaUserCircle className="user-icon" />
              <div className="user-texts">
                <span className="user-name">{usuario?.nome || 'Usuário'}</span>
                <span className="user-email">{usuario?.email || 'email@teste'}</span>
              </div>
              <button className="toggle-btn" onClick={() => setIsCollapsed(true)}>
                <FaChevronLeft />
              </button>
            </div>
          </>
        )}
      </div>


        <ul className="menu">
            {menuItems.map((item) => (
            <li
                key={item.name}
                className={location.pathname === item.path ? 'active' : ''}
                onClick={() => navigate(item.path)}
            >
                {item.icon}
                {!isCollapsed && <span>{item.name}</span>}
            </li>
            ))}
        </ul>

      <div className="logout-section" onClick={handleLogout}>
        <FaSignOutAlt />
        {!isCollapsed && <span>Sair</span>}
      </div>
    </div>
  )
}
