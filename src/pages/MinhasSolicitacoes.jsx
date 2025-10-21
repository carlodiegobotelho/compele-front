import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FaInfoCircle, FaSearch, FaEye } from "react-icons/fa";
import { useNavigate } from 'react-router-dom'
import PageHeader from "../components/PageHeader";
import "../styles/MinhasSolicitacoes.css";

export default function MinhasSolicitacoes() {
  const navigate = useNavigate();
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - 10);
  const dataFim = new Date();
  dataFim.setDate(dataFim.getDate() + 5);

  const dataInicioFormatada = dataInicio.toISOString().split("T")[0];
  const dataFimFormatada = dataFim.toISOString().split("T")[0];

  const [filtro, setFiltro] = useState({
    dataCriacaoInicio: dataInicioFormatada,
    dataCriacaoFim: dataFimFormatada,
    status: "0",
  });

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltro({ ...filtro, [name]: value });
  };

  const handleBuscar = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const response = await api.get("/api/reservas/minhas-solicitacoes", {
            params: {
                dataCriacaoInicio: filtro.dataCriacaoInicio,
                dataCriacaoFim: filtro.dataCriacaoFim,
                status: filtro.status
            }
        });
      setSolicitacoes(response.data);
    } catch (err) {
      console.error(err);
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "pendente":
        return "status-pendente";
      case "aprovado":
        return "status-aprovado";
      case "reprovado":
      case "cancelado":
        return "status-rejeitado";
      default:
        return "";
    }
  };

  const sortedSolicitacoes = [...solicitacoes].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const valueA = a[sortConfig.key];
    const valueB = b[sortConfig.key];

    if (typeof valueA === "string") {
        return sortConfig.direction === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    } else if (valueA instanceof Date) {
        return sortConfig.direction === "asc"
        ? new Date(valueA) - new Date(valueB)
        : new Date(valueB) - new Date(valueA);
    } else {
        return sortConfig.direction === "asc" ? valueA - valueB : valueB - valueA;
    }
  });

  useEffect(() => {
    handleBuscar();
    setSortConfig({ key: 'dataCriacao', direction: 'desc' });
  }, []);

  return (
    <div className="page-wrapper">
      <PageHeader title="Relatório de Reservas">
        <form onSubmit={handleBuscar}>
            <div className="filtro-inline">
                <div className="filtro-group">
                <label>Data Início</label>
                <input
                    type="date"
                    name="dataCriacaoInicio"
                    value={filtro.dataCriacaoInicio}
                    onChange={handleChange}
                />
                </div>

                <div className="filtro-group">
                <label>Data Fim</label>
                <input
                    type="date"
                    name="dataCriacaoFim"
                    value={filtro.dataCriacaoFim}
                    onChange={handleChange}
                />
                </div>

                <div className="filtro-group">
                <label>Status</label>
                <select name="status" value={filtro.status} onChange={handleChange}>
                    <option value="0">Todos</option>
                    <option value="1">Pendente</option>
                    <option value="2">Aprovado</option>
                    <option value="3">Reprovado</option>
                    <option value="4">Cancelado</option>
                </select>
                </div>

                <button type="submit" className="btn-buscar">
                <FaSearch /> Buscar
                </button>
            </div>
        </form>
      </PageHeader>

      <div className="table-wrapper">
        {loading ? (
          <p className="no-data">Carregando...</p>
        ) : solicitacoes.length === 0 ? (
          <p className="no-data">Nenhuma solicitação encontrada.</p>
        ) : (
          <table className="tabela-solicitacoes">
            <thead>
              <tr>
                {[
                { key: "usuarioSolicitanteNome", label: "Colaborador" },
                { key: "dataCriacao", label: "Criação" },
                { key: "dataInicio", label: "Início" },
                { key: "dataFim", label: "Fim" },
                { key: "cidade", label: "Cidade" },
                { key: "status", label: "Status" },
                ].map((col) => (
                <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className={
                    sortConfig.key === col.key ? `sorted-${sortConfig.direction}` : ""
                    }
                >{col.label}
                </th>
                ))}
                <th>Motivo</th>
                <th>Ação</th>
            </tr>
            </thead>
            <tbody>
              {sortedSolicitacoes.map((s) => (
                <tr key={s.id}>
                  <td>{s.usuarioSolicitanteNome || "-"}</td>
                    <td>
                    {new Date(s.dataCriacao).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                    }).replace(",", "")}
                    </td>
                  <td>{new Date(s.dataInicio).toLocaleDateString()}</td>
                  <td>{new Date(s.dataFim).toLocaleDateString()}</td>
                  <td>{s.cidade}</td>
                  <td>
                    <span className={`status-chip ${getStatusColor(s.status)}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    <div className="tooltip-container">
                      <FaInfoCircle className="info-icon" />
                      <span className="tooltip-text">{s.motivo}</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn-detalhar"
                      onClick={() => navigate(`/reserva/${s.id}`, { state: { fromList: true } })}>
                      <FaEye /> Detalhar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
