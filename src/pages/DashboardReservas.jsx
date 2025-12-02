import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import {
  FaClipboardList,
  FaMoneyBillWave,
  FaCalendarDay,
  FaSearch,
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";
import "../styles/DashboardReservas.css";

export default function DashboardReservas() {
  const [resumo, setResumo] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [centroDeCusto, setCentroDeCusto] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStatusIndex, setActiveStatusIndex] = useState(0);

  const [filtros, setFiltros] = useState({
    colaborador: "",
    centroCusto: "",
    cidade: "",
    dataInicio: "",
    dataFim: "",
  });

  const handleFiltroChange = (e) => {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  };

  const carregarDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/reservas/dashboard", {
        params: {
          colaborador: filtros.colaborador || null,
          centroDeCusto: filtros.centroCusto || null,
          cidade: filtros.cidade || null,
          dataInicio: filtros.dataInicio || null,
          dataFim: filtros.dataFim || null,
        },
      });
      setResumo(response.data);
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

  const carregarCidades = async () => {
    try {
      const response = await api.get("/api/cadastros/cidades");
      if (Array.isArray(response.data)) setCidades(response.data);
    } catch (err) {
      console.error("Erro ao carregar as cidades:", err);
    }
  };

  useEffect(() => {
    carregarColaboradores();
    carregarCentroDeCusto();
    carregarCidades();
    carregarDashboard();
  }, []);

  const formatCurrency = (num) =>
    num?.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  // Dados para gráficos
  const dadosStatus = resumo?.agrupadoPorStatus || [];
  const dadosCidades = (resumo?.agrupadoPorCidade || []).slice(0, 5);
  const dadosMeses = (resumo?.agrupadoPorMes || []).slice(-5);

  // Cores por status no gráfico de pizza
  const statusColors = {
    Pendente: "#facc15",
    "Concluído Parcialmente": "#f97316",
    Concluído: "#22c55e",
    Aprovado: "#22c55e",
    Reprovado: "#ef4444",
    Cancelado: "#6b21a8",
  };

  return (
    <div className="page-wrapper">
      <PageHeader title="Dashboard de Reservas" />

      {/* === FILTROS === */}
      <div className="filtro-container">
        <select
          style={{ width: 200 }}
          name="colaborador"
          value={filtros.colaborador}
          onChange={handleFiltroChange}
        >
          <option value="">Todos Colaboradores</option>
          {colaboradores.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome}
            </option>
          ))}
        </select>

        <select
          style={{ width: 200 }}
          name="cidade"
          value={filtros.cidade}
          onChange={handleFiltroChange}
        >
          <option value="">Todas Cidades</option>
          {cidades.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          style={{ width: 200 }}
          name="centroCusto"
          value={filtros.centroCusto}
          onChange={handleFiltroChange}
        >
          <option value="">Todos Centros de Custo</option>
          {centroDeCusto.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          style={{ width: 120, minWidth: 120 }}
          type="date"
          name="dataInicio"
          value={filtros.dataInicio}
          onChange={handleFiltroChange}
        />
        <input
          style={{ width: 120, minWidth: 120 }}
          type="date"
          name="dataFim"
          value={filtros.dataFim}
          onChange={handleFiltroChange}
        />

        <button
          onClick={carregarDashboard}
          className="btn-buscar-dashboard"
          disabled={loading}
        >
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
          {/* Quantidade de Reservas */}
          <div className="card kpi">
            <FaClipboardList />
            <div className="card-content">
              <strong>{resumo.quantidade ?? 0}</strong>
              <span>Quantidade de Reservas</span>
            </div>
          </div>

          {/* Valor Total */}
          <div className="card kpi">
            <FaMoneyBillWave />
            <div className="card-content">
              <strong>{formatCurrency(resumo.valorTotal ?? 0)}</strong>
              <span>Valor Total</span>
            </div>
          </div>

          {/* Valor Médio / Diária */}
          <div className="card kpi">
            <FaCalendarDay />
            <div className="card-content">
              <strong>{formatCurrency(resumo.valorMedioPorDiaria ?? 0)}</strong>
              <span>Valor Médio / Diária</span>
            </div>
          </div>
        </div>
      )}

      {/* === GRÁFICOS === */}
      {resumo && (
        <div className="charts-row">


{/* Pizza por Status */}
<div className="chart-card">
  <h3>Reservas por Status</h3>

  {/* Gráfico centralizado */}
  <div className="chart-graph chart-graph-center">
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={dadosStatus}
          dataKey="quantidade"
          nameKey="label"
          innerRadius={40}
          outerRadius={90}
          paddingAngle={3}
          activeIndex={activeStatusIndex}
          onClick={(_, index) => {
            // se clicar de novo na mesma fatia, desmarca
            setActiveStatusIndex(index === activeStatusIndex ? null : index);
          }}
        >
          {dadosStatus.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={
                statusColors[entry.label] ||
                ["#3b82f6", "#22c55e", "#f97316", "#ef4444", "#6b21a8"][
                  index % 5
                ]
              }
              style={{ cursor: "pointer" }}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name, props) => [
            `${value}`,
            props.payload.label,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>

  {/* Legenda embaixo, ocupando menos espaço */}
  <div className="chart-legend chart-legend-horizontal">
    {dadosStatus.map((item, idx) => (
      <div
        key={idx}
        className={`legend-item ${
          activeStatusIndex === idx ? "legend-item-active" : ""
        }`}
        onClick={() =>
          setActiveStatusIndex(activeStatusIndex === idx ? null : idx)
        }
      >
        <span
          className="legend-dot"
          style={{
            backgroundColor:
              statusColors[item.label] ||
              ["#3b82f6", "#22c55e", "#f97316", "#ef4444", "#6b21a8"][
                idx % 5
              ],
          }}
        />
        <span className="legend-label">
          {item.label} ({item.quantidade})
        </span>
      </div>
    ))}
  </div>
</div>



          {/* Barras horizontais - Cidades */}
          <div className="chart-card">
            <h3>Top 5 Cidades com Reservas</h3>
            <div className="chart-graph">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={dadosCidades}
                  margin={{ top: 20, right: 5, left: 5, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 9 }}
                    angle={-40}
                    textAnchor="end"
                    height={50}
                    width={60}
                  />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="valor" radius={[8, 8, 8, 8]} fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Barras verticais - Últimos 5 meses */}
          <div className="chart-card">
            <h3>Gastos nos últimos 5 meses</h3>
            <div className="chart-graph">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={dadosMeses}
                  margin={{ top: 20, right: 5, left: 5, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 9 }}
                    angle={-40}
                    textAnchor="end"
                    height={50}
                    width={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="valor" radius={[8, 8, 0, 0]} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
