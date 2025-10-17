import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../services/api";
import { FaArrowLeft, FaCheck, FaTimes, FaExternalLinkAlt } from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import "../styles/DetalhesReserva.css";

export default function DetalheReserva() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [reserva, setReserva] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [observacao, setObservacao] = useState("");
  const [decisaoAprovar, setDecisaoAprovar] = useState(null);

  const veioDeLista = location.state?.fromList === true;

  useEffect(() => {
    carregarReserva();
  }, [id]);

  const carregarReserva = async () => {
    try {
      const response = await api.get(`/api/reservas/${id}`);
      setReserva(response.data);
    } catch (err) {
      console.error("Erro ao carregar reserva:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (aprovar) => {
    setDecisaoAprovar(aprovar);
    setObservacao("");
    setShowModal(true);
  };

  const handleConfirmar = async () => {
    if (!reserva) return;
    setBusy(true);
    setShowModal(false);
    try {
      await api.post(`/api/reservas/${reserva.id}/decisao`, {
        aprovar: decisaoAprovar,
        observacao,
      });
      await carregarReserva(); // atualiza status após ação
    } catch (err) {
      console.error("Erro ao enviar decisão:", err);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <p>Carregando reserva...</p>;
  if (!reserva) return <p>Reserva não encontrada.</p>;

  const isAprovavel = reserva.usuarioAprovador && reserva.statusId === 1;

  return (
    <div className="page-wrapper">
      <PageHeader title={`Detalhes da Reserva`}>
      </PageHeader>

      <div className={`detalhe-container ${busy ? "busy" : ""}`}>
        <div className="detalhe-header">
            <div className="header-left">
                {veioDeLista && (
                <button className="btn-voltar" onClick={() => navigate(-1)}>
                    <FaArrowLeft /> Voltar
                </button>
                )}
                <div className="header-info">
                    <h2 className="solicitante-nome">{reserva.usuarioSolicitanteNome}</h2>
                    <p className="cidade">{reserva.cidade}</p>
                </div>
            </div>

            <span
                className={`status-badge ${
                reserva.statusId === 1
                    ? "pendente"
                    : reserva.statusId === 2
                    ? "aprovado"
                    : "reprovado"
                }`}
            >
                {reserva.status}
            </span>
            </div>

        <p className="codigo">Código da Reserva: <strong>{reserva.codigoReserva}</strong></p>

        <div className="grid-info">
          <div><strong>Período:</strong> {new Date(reserva.dataInicio).toLocaleDateString("pt-BR")} - {new Date(reserva.dataFim).toLocaleDateString("pt-BR")}</div>
          <div><strong>Tipo de Reserva:</strong> {reserva.tipoReserva === 1 ? "Nova" : "Renovação"}</div>
          <div><strong>Anfitrião:</strong> {reserva.nomeAnfitriao}</div>
          <div><strong>Telefone:</strong> {reserva.telefoneAnfitriao}</div>
          <div><strong>Quantidade de Pessoas:</strong> {reserva.quantidadePessoas}</div>
          <div><strong>Valor Imóvel:</strong> {reserva.valorImovel.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
          <div><strong>Valor Real:</strong> {reserva.valorReal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
          <div><strong>Valor c/ Taxa:</strong> {reserva.valorComTaxa.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</div>
        </div>

        <div className="motivo">
          <strong>Motivo:</strong>
          <p>{reserva.motivo}</p>
        </div>

        <a
          href={reserva.linkImovel}
          target="_blank"
          rel="noopener noreferrer"
          className="link-imovel"
        >
          Ver imóvel <FaExternalLinkAlt size={12} />
        </a>

        {isAprovavel && (
          <div className="detalhe-actions">
            <button
              className="btn-aprovar"
              onClick={() => handleOpenModal(true)}
              disabled={busy}
            >
              <FaCheck /> Aprovar
            </button>
            <button
              className="btn-reprovar"
              onClick={() => handleOpenModal(false)}
              disabled={busy}
            >
              <FaTimes /> Reprovar
            </button>
          </div>
        )}
      </div>

      {/* Modal de observação */}
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
                className={decisaoAprovar ? "btn-aprovar" : "btn-reprovar"}
                onClick={handleConfirmar}
              >
                {decisaoAprovar ? <><FaCheck /> Aprovar</> : <><FaTimes /> Reprovar</>}
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
