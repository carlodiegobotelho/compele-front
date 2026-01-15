import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import {
  FaClipboardList,
  FaMoneyBillWave,
  FaCalendarDay,
  FaEye,
  FaEyeSlash
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
import { STATUS_COLORS } from "../data/statusColors";
import api from "../services/api";
import "../styles/DashboardReservas.css";
import { FaMoneyBillTrendUp } from "react-icons/fa6";

export default function DashboardReservas() {
  const [resumo, setResumo] = useState(null);
  const [colaboradores, setColaboradores] = useState([]);
  const [centroDeCusto, setCentroDeCusto] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeStatusIndex, setActiveStatusIndex] = useState(0);
  const [activeStatusReservaIndex, setActiveStatusReservaIndex] = useState(0);

  const [filtros, setFiltros] = useState({
    colaborador: "",
    centroCusto: "",
    cidade: "",
    periodo: "TODOS",
    filtrarValorSemTaxa: false,
  });

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleSemTaxa = () => {
    setFiltros((prev) => ({
      ...prev,
      filtrarValorSemTaxa: !prev.filtrarValorSemTaxa,
    }));
  };

  const carregarDashboard = async () => {
    try {
      setLoading(true);

      const { dataInicio, dataFim } = calcularIntervaloPorPeriodo();

      const response = await api.get("/api/reservas/dashboard", {
        params: {
          colaborador: filtros.colaborador || null,
          centroDeCusto: filtros.centroCusto || null,
          cidade: filtros.cidade || null,
          dataInicio,
          dataFim,
          FiltrarValorSemTaxa: filtros.filtrarValorSemTaxa,
        },
      });

      setResumo(response.data);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const calcularIntervaloPorPeriodo = () => {
    const hoje = new Date();
    let dataInicio = null;
    let dataFim = null;

    switch (filtros.periodo) {
      case "DIA": {
        dataInicio = hoje;
        dataFim = hoje;
        break;
      }
      case "SEMANA": {
        dataFim = hoje;
        const inicio = new Date();
        inicio.setDate(hoje.getDate() - 7);
        dataInicio = inicio;
        break;
      }
      case "MES": {
        dataFim = hoje;
        const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
        dataInicio = inicio;
        break;
      }
      case "SEMESTRE": {
        dataFim = hoje;
        const inicio = new Date();
        inicio.setMonth(hoje.getMonth() - 6);
        dataInicio = inicio;
        break;
      }
      case "ANO": {
        dataFim = hoje;
        const inicio = new Date(hoje.getFullYear(), 0, 1);
        dataInicio = inicio;
        break;
      }
      case "TODOS":
      default: {
        dataInicio = null;
        dataFim = null;
        break;
      }
    }

    const toInputDate = (d) => (d ? d.toISOString().slice(0, 10) : null);

    return {
      dataInicio: toInputDate(dataInicio),
      dataFim: toInputDate(dataFim),
    };
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
  }, []);

  useEffect(() => {
    carregarDashboard();
  }, [filtros]);

  const formatCurrency = (num) =>
    num?.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  // Dados para gráficos
  const dadosStatus = resumo?.recibosAgrupadoPorStatus || [];
  const dadosStatusReserva = resumo?.agrupadoPorStatus || [];
  const dadosCidades = (resumo?.agrupadoPorCidade || []).slice(0, 5);
  const dadosMeses = (resumo?.agrupadoPorMes || []).slice(-6);
  const dadosComparativo = (resumo?.comparativoHotelaria || []).slice(-2);

  return (
    <div className="page-wrapper">
      <PageHeader title="Dashboard de Reservas" />

            {/* === FILTROS === */}
      <div className="filtro-container">
        <select
          style={{ width: '20%' }}
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
          style={{ width: '20%' }}
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

        <select
          style={{ width: '20%' }}
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

        {/* Combo de Período */}
        <select
          style={{ width: '20%' }}
          name="periodo"
          value={filtros.periodo}
          onChange={handleFiltroChange}
        >
          <option value="DIA">Dia</option>
          <option value="SEMANA">Semana</option>
          <option value="MES">Mês</option>
          <option value="SEMESTRE">Semestre</option>
          <option value="ANO">Ano</option>
          <option value="TODOS">Todo o período</option>
        </select>

        <button
          type="button"
          className={`tax-toggle-btn ${
            filtros.filtrarValorSemTaxa ? "off" : "on"
          }`}
          onClick={handleToggleSemTaxa}
        >
          {filtros.filtrarValorSemTaxa ? <FaEyeSlash /> : <FaEye />}
          <span>
            {filtros.filtrarValorSemTaxa ? "Sem taxa" : "Com taxa"}
          </span>
        </button>
      </div>

      {resumo && (
        <div className="cards-container">
          <div className="card kpi">
            <FaClipboardList />
            <div className="card-content">
              <strong>{resumo.quantidadeRecibos ?? 0}</strong>
              <span>Quantidade de Recibos</span>
            </div>
          </div>

          <div className="card kpi">
            <FaMoneyBillWave />
            <div className="card-content">
              <strong>{formatCurrency(resumo.valorTotal ?? 0)}</strong>
              <span>Valor Total</span>
            </div>
          </div>

          <div className="card kpi">
            <FaCalendarDay />
            <div className="card-content">
              <strong>{formatCurrency(resumo.valorMedioPorDiaria ?? 0)}</strong>
              <span>Valor Médio / Diária / Pessoa</span>
            </div>
          </div>

          <div className="card kpi kpi-tooltip">
            <FaMoneyBillTrendUp />

            <div className="card-content">
              <strong>{formatCurrency(resumo.valorEconomiaEstimada ?? 0)}</strong>
              <span>Economia Estimada</span>
            </div>

            {Array.isArray(resumo.mediaHotelariaPorCidade) &&
              resumo.mediaHotelariaPorCidade.length > 0 && (
                <div className="kpi-tooltip-box">
                  <div className="kpi-tooltip-title">Tarifa Hotel</div>

                  <div className="kpi-tooltip-list">
                    {resumo.mediaHotelariaPorCidade.map((item) => (
                      <div key={item.cidade} className="kpi-tooltip-row">
                        <span className="kpi-tooltip-city">{item.cidade}:</span>
                        <span className="kpi-tooltip-value">
                          {item.valorHotelariaDiario?.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}
                          /dia
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

        </div>
      )}

      {resumo && (
        <div className="charts-row">

          <div className="chart-card">
            <h3>Recibos ({resumo.quantidadeRecibos ?? 0})</h3>

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
                      setActiveStatusIndex(index === activeStatusIndex ? null : index);
                    }}
                  >
                    {dadosStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.label].bg || "#3b82f6"
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
                        STATUS_COLORS[item.label].bg || "#3b82f6"
                    }}
                  />
                  <span className="legend-label">
                    {item.label} ({item.quantidade})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>Top 5 Cidades por Gastos</h3>
            <div className="chart-graph">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={dadosCidades}
                  margin={{ top: 10, right: 2, left: 2, bottom: 10 }}
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
            <h3>Compele x Hotelaria</h3>
            <div className="chart-graph">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={dadosComparativo}
                  margin={{ top: 10, right: 2, left: 2, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11 }}
                    height={50}
                    width={60}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar dataKey="valor" radius={[8, 8, 0, 0]}>
                    {dadosComparativo.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

        {/* === GRÁFICOS === */}
      {resumo && (
        <div className="charts-row-bottom">

          <div className="chart-card">
            <h3>Reservas ({resumo.quantidade ?? 0})</h3>
            
            <div className="chart-graph chart-graph-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={dadosStatusReserva}
                    dataKey="quantidade"
                    nameKey="label"
                    innerRadius={40}
                    outerRadius={90}
                    paddingAngle={3}
                    activeIndex={activeStatusReservaIndex}
                    onClick={(_, index) => {
                      setActiveStatusReservaIndex(index === activeStatusReservaIndex ? null : index);
                    }}
                  >
                    {dadosStatusReserva.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          STATUS_COLORS[entry.label].bg || "#3b82f6"
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

            <div className="chart-legend chart-legend-horizontal">
              {dadosStatusReserva.map((item, idx) => (
                <div
                  key={idx}
                  className={`legend-item ${
                    activeStatusReservaIndex === idx ? "legend-item-active" : ""
                  }`}
                  onClick={() =>
                    setActiveStatusReservaIndex(activeStatusReservaIndex === idx ? null : idx)
                  }
                >
                  <span
                    className="legend-dot"
                    style={{
                      backgroundColor:
                        STATUS_COLORS[item.label].bg || "#3b82f6"
                    }}
                  />
                  <span className="legend-label">
                    {item.label} ({item.quantidade})
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="chart-card">
            <h3>Quantidade de Reservas – Últimos 6 Meses</h3>
            <div className="chart-graph">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={dadosMeses}
                  margin={{ top: 10, right: 2, left: 2, bottom: 10 }}
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
                    formatter={(value) => value}
                  />
                  <Bar dataKey="quantidade" radius={[8, 8, 8, 8]} fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
