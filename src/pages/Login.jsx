import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { login } from '../services/authService'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('Compele-ChaveAcesso')
    if (token) {
      navigate('/principal')
    }
  }, [navigate])

  async function handleLogin(e) {
    e.preventDefault()

    try {
        const response = await login(email, senha)

        localStorage.setItem('Compele-ChaveAcesso', response.token)

        localStorage.setItem('Compele-DadosUsuario', JSON.stringify({
          id: response.id,
          nome: response.nome,
          email: response.email
        }))

      navigate('/principal')
    } catch (error) {
      toast.error(error?.erros?.[0] || 'Erro ao fazer login')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <img src="/logo.png" alt="COMPELE" className="logo" />
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <label>E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="senha-row">
            <label>Senha</label>
            <a href="#">Esqueceu a senha?</a>
          </div>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <button type="submit">Entrar</button>
        </form>
      </div>
      <ToastContainer position="top-right" />
    </div>
  )
}
