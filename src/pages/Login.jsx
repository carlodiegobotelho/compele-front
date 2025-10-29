import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ToastContainer } from 'react-toastify'
import { login } from '../services/authService'
import {
  FaSpinner,
} from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('Compele-ChaveAcesso')
    if (token) {
      navigate('/principal')
    }
  }, [navigate])

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Compele</h2>
        <div className="divider-login"></div>
        <h3>Acesse sua conta</h3>
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
          </div>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? (
              <>
                <FaSpinner className="spinner" /> Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" />
    </div>
  )
}
