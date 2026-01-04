import React, { useState, useEffect } from "react";
import api from "../services/api";
import { FaInfoCircle, FaSearch, FaEye, FaFileExcel } from "react-icons/fa";
import { useNavigate } from 'react-router-dom'
import PageHeader from "../components/PageHeader";
import "../styles/MinhasSolicitacoes.css";
import { STATUS_COLORS } from "../data/statusColors";

export default function MinhasSolicitacoes() {
  const navigate = useNavigate();
  const dataInicio = new Date();
  dataInicio.setDate(dataInicio.getDate() - 60);
  const dataFim = new Date();
  dataFim.setDate(dataFim.getDate() + 1);

  const dataInicioFormatada = dataInicio.toISOString().split("T")[0];
  const dataFimFormatada = dataFim.toISOString().split("T")[0];

  const [filtro, setFiltro] = useState({
    dataCriacaoInicio: dataInicioFormatada,
    dataCriacaoFim: dataFimFormatada,
    status: "0",
    colaborador: null,
    cidade: null,
    centroDeCusto: null,
    dataReservaInicio: null,
    dataReservaFim: null,
  });

  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [colaboradores, setColaboradores] = useState([]);
  const [centroDeCusto, setCentroDeCusto] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [linkExportar, setLinkExportar] = useState("");

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
        direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const carregarColaboradores = async () => {
    try {
      const response = await api.get("/api/cadastros/colaboradores");
      if (Array.isArray(response.data)) setColaboradores(response.data);
    } catch (err) {
      console.error("Erro ao carregar colaboradores:", err);
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

  const carregarCentroDeCusto = async () => {
    try {
      const response = await api.get("/api/cadastros/centro-de-custo");
      if (Array.isArray(response.data)) setCentroDeCusto(response.data);
    } catch (err) {
      console.error("Erro ao carregar centro de custo:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFiltro({ ...filtro, [name]: value });
    const exportUrl = getExportUrl(filtro);
    setLinkExportar(exportUrl);
  };

  const handleBuscar = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const response = await api.get("/api/reservas/minhas-solicitacoes", {
            params: filtro
        });
      setSolicitacoes(response.data);
      const exportUrl = getExportUrl(filtro);
      setLinkExportar(exportUrl);
    } catch (err) {
      console.error(err);
      setSolicitacoes([]);
    } finally {
      setLoading(false);
    }
  };

  const getExportUrl = (filtros) => {
    const params = new URLSearchParams(
      Object.fromEntries(
        Object.entries(filtros).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
      )
    ).toString();

    return `https://compeleservice.com/compele-api/api/reservas/exportar-minhas-solicitacoes${params ? `?${params}` : ""}`;
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

  const exportar = (link) => {
    window.open(link, '_blank');
  };

  useEffect(() => {
    handleBuscar();
    carregarColaboradores();
    carregarCidades();
    carregarCentroDeCusto();
    setSortConfig({ key: 'dataCriacao', direction: 'desc' });
  }, []);

  return (
    <div className="page-wrapper">
      <PageHeader title="Relatório de Reservas">
        <form onSubmit={handleBuscar}>
            <div className="filtro-inline">

                <div className="filtro-group relatorio">
                  <label>Colaborador</label>
                  <select
                      style={{ width: 190 }}
                      name="colaborador"
                      value={filtro.colaborador}
                      onChange={handleChange}
                    >
                      <option value="">Todos Colaboradores</option>
                      {colaboradores.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.nome}
                        </option>
                      ))}
                    </select>
                </div>

                <div className="filtro-group relatorio">
                  <label>Cidade</label>
                  <select
                      style={{ width: 190 }}
                      name="cidade"
                      value={filtro.cidade}
                      onChange={handleChange}
                    >
                      <option value="">Todas Cidades</option>
                      {cidades.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                </div>

                <div className="filtro-group relatorio">
                  <label>Centro de Custo</label>
                  <select
                      style={{ width: 190 }}
                      name="centroDeCusto"
                      value={filtro.centroDeCusto}
                      onChange={handleChange}
                    >
                      <option value="">Todos</option>
                      {centroDeCusto.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                </div>

                <div className="filtro-group relatorio">
                  <label>Status</label>
                  <select name="status" value={filtro.status} onChange={handleChange}>
                      <option value="0">Todos</option>
                      <option value="1">Pendente</option>
                      <option value="2">Aprovado</option>
                      <option value="3">Reprovado</option>
                      <option value="4">Cancelado</option>
                      <option value="5">Concluída Parcelada</option>
                      <option value="6">Concluída</option>
                  </select>
                </div>

                <div className="filtro-group relatorio">
                  <label>Data Criação Início</label>
                  <input
                      type="date"
                      name="dataCriacaoInicio"
                      value={filtro.dataCriacaoInicio}
                      onChange={handleChange}
                  />
                </div>

                <div className="filtro-group relatorio">
                  <label>Data Criação Fim</label>
                  <input
                      type="date"
                      name="dataCriacaoFim"
                      value={filtro.dataCriacaoFim}
                      onChange={handleChange}
                  />
                </div>

                <div className="filtro-group relatorio">
                  <label>Data Estadia Início</label>
                  <input
                      type="date"
                      name="dataReservaInicio"
                      value={filtro.dataReservaInicio}
                      onChange={handleChange}
                  />
                </div>

                <div className="filtro-group relatorio">
                  <label>Data Estadia Fim</label>
                  <input
                      type="date"
                      name="dataReservaFim"
                      value={filtro.dataReservaFim}
                      onChange={handleChange}
                  />
                </div>

                <button type="submit" className="btn-buscar">
                  <FaSearch /> Buscar
                </button>

                <button  onClick={() => exportar(linkExportar)} className="btn-buscar excel">
                  <FaFileExcel /> Exportar
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
                { key: "valorImovel", label: "Valor Imovel" },
                { key: "valorComTaxa", label: "Valor Total" },
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
                <th></th>
            </tr>
            </thead>
            <tbody>
              {sortedSolicitacoes.map((s) => (
                <tr key={s.id}>
                  <td>{s.usuarioColaboradorNome || "-"}</td>
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
                  <td>{s.valorImovel.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}</td>
                  <td>{s.valorComTaxa.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}</td>
                  <td>
                    <div className="tooltip-container">
                      <span className={`status-chip`} style={{
                          backgroundColor: STATUS_COLORS[s.status]?.bg || "#3b82f6",
                          color: STATUS_COLORS[s.status]?.text || "#ffffff"
                        }}>
                        {s.status}
                      </span>
                      <span className="tooltip-text">{s.motivo}</span>
                    </div>
                  </td>
                  <td>
                    <button
                      className="btn-detalhar"
                      onClick={() => navigate(`/reserva/${s.id}`, { state: { fromList: true } })}>
                      <FaEye />
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
