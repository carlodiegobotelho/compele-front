import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import {
  FaClipboardList,
  FaMoneyBillWave,
  FaChartLine,
  FaCalendarDay,
  FaSearch,
  FaInfoCircle,
  FaEye,
  FaEyeSlash 
} from "react-icons/fa";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
} from "recharts";
import api from "../services/api";
import "../styles/DashboardReservas.css";

export default function DashboardReservas() {
  const [activeMetric, setActiveMetric] = useState("quantidade");
  const [resumo, setResumo] = useState(null);
  const [historico, setHistorico] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [centroDeCusto, setCentroDeCusto] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showValoresRealizados, setShowValoresRealizados] = useState(false);
  const [showValoresComTaxa, setShowValoresComTaxa] = useState(true);
  const [showValoresMediosPorDiaria, setShowValoresMediosPorDiaria] = useState(true);

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
    setHistorico(
      metric === "quantidade"
        ? resumo?.historicoQuantidade
        : metric === "valorRealizado"
        ? resumo?.historicoValorRealizado
        : metric === "valorComTaxa"
        ? resumo?.historicoValorComTaxa
        : resumo?.historicoValorMedio
    );
  };

  const carregarDashboard = async (metric = activeMetric) => {
    try {
      setLoading(true);
      const response = await api.get("/api/reservas/dashboard", {
        params: {
          colaborador: filtros.colaborador || null,
          centroDeCusto: filtros.centroCusto || null,
          dataInicio: filtros.dataInicio || null,
          dataFim: filtros.dataFim || null,
          entidade: metric,
        },
      });
      setResumo(response.data);
      setHistorico(
        metric === "quantidade"
          ? response.data.historicoQuantidade
          : metric === "valorRealizado"
          ? response.data.historicoValorRealizado
          : metric === "valorComTaxa"
          ? response.data.historicoValorComTaxa
          : response.data.historicoValorMedio
      );
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const carregarColaboradores = async () => {
    try {
      const response = await api.get("/api/cadastros/colaboradores");
      if (Array.isArray(response.data)) setColaboradores(response.data);
    } catch (err) {
      console.error("Erro ao carregar colaboradores:", err);
    }
  };

  const carregarCentroDeCusto = async () => {
    try {
      const response = await api.get("/api/cadastros/centro-de-custo");
      if (Array.isArray(response.data)) setCentroDeCusto(response.data);
    } catch (err) {
      console.error("Erro ao carregar centro de custo:", err);
    }
  };

  useEffect(() => {
    carregarColaboradores();
    carregarCentroDeCusto();
    carregarDashboard();
  }, []);

  const formatCurrency = (num) =>
    num?.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  const coresStatus = {
    Pendente: "#facc15",
    Aprovado: "#3b82f6",
    Reprovado: "#ef4444",
    Cancelado: "#8b5cf6",
    Concluida: "#22c55e",
  };

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
          {centroDeCusto.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
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

        <button
          onClick={carregarDashboard(activeMetric)}
          className="btn-buscar-dashboard"
          disabled={loading}
        >
          {loading ? <span className="spinner" /> : <><FaSearch /> <span>Buscar</span></>}
        </button>
      </div>

      {/* === CARDS PRINCIPAIS === */}
      {resumo && (
        <div className="cards-container">
          {/* === QUANTIDADE DE RESERVAS === */}
          <div
            className={`card-quantidade-reservas card kpi ${activeMetric === "quantidade" ? "active" : ""}`}
            onClick={() => handleCardClick("quantidade")}
          >
            <FaInfoCircle className="info-icon-dash-card" />
            <FaClipboardList />
            <div className="card-content">
              <strong>{resumo.quantidade}</strong>
              <span>Número de Reservas</span>

              {resumo.contador && resumo.contador.length > 0 && (
                <div className="status-tooltip">
                  {resumo.contador
                  .filter((item) => { return item.quantidade > 0 })
                  .map((item) => {
                    const colorMap = {
                      Pendente: "#facc15",   // 🟡
                      Aprovado: "#3b82f6",   // 🔵
                      Reprovado: "#ef4444",  // 🔴
                      Cancelado: "#8b5cf6",  // 🟣
                      Concluida: "#22c55e",  // 🟢
                    };
                    return (
                      <div key={item.label} className="status-item">
                        <span
                          className="status-dot"
                          style={{ backgroundColor: colorMap[item.label] || "#9ca3af" }}
                        ></span>
                        <span className="status-label">
                          {item.label}: {item.quantidade}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>


          <div
            className={`card kpi ${activeMetric === "valorRealizado" ? "active" : ""}`}
            onClick={() => handleCardClick("valorRealizado")}
          >
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setShowValoresRealizados(!showValoresRealizados);
              }}>
              {showValoresRealizados ? <FaEye className="info-icon-dash-card" /> : <FaEyeSlash className="info-icon-dash-card" />}
            </div>
            <FaMoneyBillWave />
            <div>
              <strong>
                {showValoresRealizados
                  ? formatCurrency(resumo.valorRealizado)
                  : "••••••"}
              </strong>
              <span>Valor Realizado</span>
            </div>
          </div>

          <div
            className={`card kpi ${activeMetric === "valorComTaxa" ? "active" : ""}`}
            onClick={() => handleCardClick("valorComTaxa")}
          >
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setShowValoresComTaxa(!showValoresComTaxa);
              }}>
              {showValoresComTaxa ? <FaEye className="info-icon-dash-card" /> : <FaEyeSlash className="info-icon-dash-card" />}
            </div>
            <FaMoneyBillWave />
            <div>
              <strong>
                {showValoresComTaxa
                  ? formatCurrency(resumo.valorComTaxa)
                  : "••••••"}
              </strong>
              <span>Valor com Taxa</span>
            </div>
          </div>

          <div
            className={`card kpi ${activeMetric === "valorMedioPorDiaria" ? "active" : ""}`}
            onClick={() => handleCardClick("valorMedioPorDiaria")}
          >
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setShowValoresMediosPorDiaria(!showValoresMediosPorDiaria);
              }}>
              {showValoresMediosPorDiaria ? <FaEye className="info-icon-dash-card" /> : <FaEyeSlash className="info-icon-dash-card" />}
            </div>
            <FaCalendarDay />
            <div>
              <strong>
                {showValoresMediosPorDiaria
                  ? formatCurrency(resumo.valorMedioPorDiaria)
                  : "••••••"}
              </strong>
              <span>Valor Médio / Diária</span>
            </div>
          </div>
        </div>
      )}

      {/* === GRÁFICO DE LINHA === */}
      {historico && (
        <div className="grafico-container">
          <h3>
            Histórico de{" "}
            {activeMetric === "quantidade"
              ? "Reservas"
              : activeMetric === "valorRealizado"
              ? "Valor Realizado"
              : activeMetric === "valorComTaxa"
              ? "Valor com Taxa"
              : "Valor Médio por Diária"}
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
                    : activeMetric === "valorRealizado"
                    ? "#22c55e"
                    : activeMetric === "valorComTaxa"
                    ? "#8b5cf6"
                    : "#f59e0b"
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
