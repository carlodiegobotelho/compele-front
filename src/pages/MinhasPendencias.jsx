import React, { useState, useEffect } from "react";
import api from "../services/api";
import PageHeader from "../components/PageHeader";
import { useNavigate } from 'react-router-dom'
import {
  FaCoffee,
  FaCheck,
  FaTimes,
  FaExternalLinkAlt,
  FaEye,
  FaSyncAlt,
} from "react-icons/fa";
import "../styles/MinhasPendencias.css";

export default function MinhasPendencias() {
  const [pendencias, setPendencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyCard, setBusyCard] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [decisaoAtual, setDecisaoAtual] = useState(null); // {id, aprovar}
  const navigate = useNavigate();
  
  const carregarPendencias = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/reservas/minhas-pendencias");
      setPendencias(response.data);
    } catch (err) {
      console.error(err);
      setPendencias([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPendencias();
  }, []);

  const handleOpenModal = (id, aprovar) => {
    setDecisaoAtual({ id, aprovar });
    setObservacao("");
    setShowModal(true);
  };

  const handleConfirmarDecisao = async () => {
    if (!decisaoAtual) return;
    const { id, aprovar } = decisaoAtual;

    setBusyCard(id);
    setShowModal(false);

    try {
      await api.post(`/api/reservas/${id}/decisao`, {
        aprovar,
        observacao,
      });
      setPendencias((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Erro ao enviar decisão:", err);
    } finally {
      setBusyCard(null);
    }
  };

  return (
    <div className="page-wrapper">
      <PageHeader title="Minhas Pendências" />

      {loading ? (
        <p>Carregando pendências...</p>
      ) : pendencias.length === 0 ? (
        <div className="no-pendencias">
          <FaCoffee className="coffee-icon" />
          <p>Você não tem pendências</p>
        </div>
      ) : (
        <div className="pendencias-lista">
          {pendencias.map((p) => (
            <div className={`card-pendencia ${busyCard === p.id ? "busy" : ""}`} key={p.id}>
              <div className="card-header">
                <div className="header-left">
                  <h3>Colaborador: {p.usuarioSolicitanteNome}</h3>
                  <span className="cidade">Cidade: {p.cidade}</span>
                </div>
                <a
                  href={p.linkImovel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-imovel"
                >
                  Ver imóvel <FaExternalLinkAlt size={12} />
                </a>
              </div>

              <div className="card-body">
                <div className="col">
                  <p><strong>Período:</strong> {new Date(p.dataInicio).toLocaleDateString("pt-BR")} - {new Date(p.dataFim).toLocaleDateString("pt-BR")}</p>
                  <p><strong>Tipo:</strong> {p.tipoReserva === 1 ? "Nova" : "Renovação"}</p>
                  <p><strong>Qtde. Pessoas:</strong> {p.quantidadePessoas}</p>
                </div>
                <div className="col">
                  <p><strong>Anfitrião:</strong> {p.nomeAnfitriao}</p>
                  <p><strong>Telefone:</strong> {p.telefoneAnfitriao}</p>
                  <p><strong>Código da Reserva:</strong> {p.codigoReserva}</p>
                </div>
                <div className="col">
                  <p><strong>Valor Imóvel:</strong> {p.valorImovel.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                  <p><strong>Valor Real:</strong> {p.valorReal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                </div>

                <div className="col-2">
                  <p><strong>Motivo:</strong> {p.motivo}</p>
                </div>
              </div>

              <div className="card-actions">
                <button
                  className="btn-aprovar"
                  onClick={() => handleOpenModal(p.id, true)}
                  disabled={busyCard === p.id}
                >
                  <FaCheck /> Aprovar
                </button>
                <button
                  className="btn-reprovar"
                  onClick={() => handleOpenModal(p.id, false)}
                  disabled={busyCard === p.id}
                >
                  <FaTimes /> Reprovar
                </button>
                <button
                  className="btn-detalhar" 
                  onClick={() => navigate(`/reserva/${p.id}`, { state: { fromList: true } })}
                  disabled={busyCard === p.id}>
                  <FaEye /> Detalhar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* BOTÃO FLUTUANTE DE REFRESH */}
      <button className="floating-refresh" onClick={carregarPendencias} title="Atualizar pendências">
        <FaSyncAlt />
      </button>

      {/* MODAL DE OBSERVAÇÃO */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Digite uma observação para seguir com sua decisão</h3>
            <textarea
              placeholder="Ex: Justificativa da decisão..."
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
            />
            <div className="modal-actions">
              <button
                className={decisaoAtual?.aprovar ? "btn-aprovar" : "btn-reprovar"}
                onClick={handleConfirmarDecisao}
              >
                {decisaoAtual?.aprovar ? <><FaCheck /> Aprovar</> : <><FaTimes /> Reprovar</>}
              </button>
              <button className="btn-cancelar" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
