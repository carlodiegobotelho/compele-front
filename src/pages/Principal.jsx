import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Principal() {
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('Compele-ChaveAcesso')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  return (
    <div style={{ padding: '30px' }}>
      <h1>Bem-vindo à Página Principal!</h1>
      <p>Conteúdo principal do sistema.</p>
    </div>
  )
}
