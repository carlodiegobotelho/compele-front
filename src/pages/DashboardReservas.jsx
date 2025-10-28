import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import {
  FaClipboardList,
  FaMoneyBillWave,
  FaChartLine,
  FaSearch,
  FaArrowDown,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";
import "../styles/DashboardReservas.css";

export default function DashboardReservas() {
  const [activeMetric, setActiveMetric] = useState("quantidade");
  const [resumo, setResumo] = useState(null);
  const [historico, setHistorico] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    colaborador: "",
    centroCusto: "",
    dataInicio: "",
    dataFim: "",
  });

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const handleCardClick = async (metric) => {
    setActiveMetric(metric);
      setHistorico(metric == "quantidade" ?
        resumo.historicoQuantidade : metric == "valorTotal" ?
            resumo.historicoValorTotal : resumo.historicoValorReal);
  };

  const carregarDashboard = async (metric= activeMetric) => {
    try {
      setLoading(true);

      const response = await api.get("/api/reservas/dashboard", {
        params: {
          colaborador: filtros.colaborador || null,
          centroCusto: filtros.centroCusto || null,
          dataInicio: filtros.dataInicio || null,
          dataFim: filtros.dataFim || null,
          entidade: metric
        },
      });

      setResumo(response.data);
      setHistorico(metric == "quantidade" ?
        response.data.historicoQuantidade : metric == "valorTotal" ?
            response.data.historicoValorTotal : response.data.historicoValorReal);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

   const carregarColaboradores = async () => {
    try {
      const response = await api.get("/api/cadastros/colaboradores");
      if (Array.isArray(response.data)) {
        setColaboradores(response.data);
      }
    } catch (err) {
      console.error("Erro ao carregar colaboradores:", err);
    }
  };

  useEffect(() => {
    carregarColaboradores();
    carregarDashboard();
  }, []);

  const formatCurrency = (num) =>
    num?.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  const calcularEconomia = () => {
    if (!resumo) return null;
    if (resumo.valorReal < resumo.valorTotal) {
      const economia =
        ((resumo.valorTotal - resumo.valorReal) / resumo.valorTotal) * 100;
      return economia > 2 ? economia.toFixed(1) : null;
    }
    return null;
  };

  const economia = calcularEconomia();

  return (
    <div className="page-wrapper">
      <PageHeader title="Dashboard de Reservas" />

      {/* === FILTROS === */}
      <div className="filtro-container">
        <select
          name="colaborador"
          value={filtros.colaborador}
          onChange={handleFiltroChange}
        >
          <option value="">Todos os colaboradores</option>
          {colaboradores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <select
          name="centroCusto"
          value={filtros.centroCusto}
          onChange={handleFiltroChange}
        >
          <option value="">Todos os centros de custo</option>
          <option value="CC01">Administrativo</option>
          <option value="CC02">Comercial</option>
          <option value="CC03">Tecnologia</option>
        </select>

        <input
          type="date"
          name="dataInicio"
          value={filtros.dataInicio}
          onChange={handleFiltroChange}
        />
        <input
          type="date"
          name="dataFim"
          value={filtros.dataFim}
          onChange={handleFiltroChange}
        />

        <button onClick={carregarDashboard} className="btn-buscar-dashboard" disabled={loading}>
          {loading ? (
            <span className="spinner" />
          ) : (
            <>
              <FaSearch /> <span>Buscar</span>
            </>
          )}
        </button>
      </div>

      {/* === CARDS PRINCIPAIS === */}
      {resumo && (
        <div className="cards-container">
          <div
            className={`card kpi ${
              activeMetric === "quantidade" ? "active" : ""
            }`}
            onClick={() => handleCardClick("quantidade")}
          >
            <FaClipboardList />
            <div>
              <strong>{resumo.quantidade}</strong>
              <span>Reservas</span>
            </div>
          </div>

          <div
            className={`card kpi ${
              activeMetric === "valorTotal" ? "active" : ""
            }`}
            onClick={() => handleCardClick("valorTotal")}
          >
            <FaMoneyBillWave />
            <div>
              <strong>{formatCurrency(resumo.valorTotal)}</strong>
              <span>Valor Total</span>
            </div>
          </div>

          <div
            className={`card kpi ${
              activeMetric === "valorReal" ? "active" : ""
            }`}
            onClick={() => handleCardClick("valorReal")}
          >
            <FaChartLine />
            <div>
              <strong>
                {formatCurrency(resumo.valorReal)}
              </strong>
              <span>Valor Real</span>
            </div>
          </div>
        </div>
      )}

      {/* === GRÁFICO === */}
      {historico && (
        <div className="grafico-container">
          <h3>
            Histórico de{" "}
            {activeMetric === "quantidade"
              ? "Reservas"
              : activeMetric === "valorTotal"
              ? "Valor Total"
              : "Valor Real"}
          </h3>

          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={historico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="periodo" />
              <YAxis />
              <Tooltip
                formatter={(v) =>
                  activeMetric === "quantidade" ? v : formatCurrency(v)
                }
              />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={
                  activeMetric === "quantidade"
                    ? "#3b82f6"
                    : activeMetric === "valorTotal"
                    ? "#8b5cf6"
                    : "#22c55e"
                }
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
