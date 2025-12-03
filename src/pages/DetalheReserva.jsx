import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import api from "../services/api";
import {
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaExternalLinkAlt,
  FaFileUpload,
  FaSpinner,
  FaEye,
  FaDownload,
  FaTrash,
} from "react-icons/fa";
import PageHeader from "../components/PageHeader";
import "../styles/DetalhesReserva.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function DetalheReserva() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [reserva, setReserva] = useState(null);
  const [recibos, setRecibos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [arquivosSelecionados, setArquivosSelecionados] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showModalInclusaoRecibo, setShowModalInclusaoRecibo] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [observacao, setObservacao] = useState("");
  const [decisaoAprovar, setDecisaoAprovar] = useState(null);
  const [loadingDownloadId, setLoadingDownloadId] = useState(null);
  const [loadingViewId, setLoadingViewId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const veioDeLista = location.state?.fromList === true;

  useEffect(() => {
    carregarReserva();
    carregarRecibos();
  }, [id]);

  const carregarReserva = async () => {
    try {
      const response = await api.get(`/api/reservas/${id}`);
      setReserva(response.data);
    } catch (err) {
      toast.error("Erro ao carregar reserva.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const carregarRecibos = async () => {
    try {
      const response = await api.get(`/api/reservas/${id}/recibos`);
      setRecibos(response.data);
    } catch (err) {
      toast.error("Erro ao carregar recibos.");
      console.error(err);
    }
  };

  const handleConfirmar = async () => {
    if (!reserva) return;

    if (decisaoAprovar == false && !observacao)
    {
      toast.error("Digite uma justificativa para a reprovação da reserva.");
      return;
    }

    setBusy(true);
    setShowModal(false);
    try {
      await api.post(`/api/reservas/${reserva.id}/decisao`, {
        aprovar: decisaoAprovar,
        observacao,
      });
      await carregarReserva();
      toast.success("Decisão registrada com sucesso!");
    } catch (err) {
      toast.error("Erro ao enviar decisão.");
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  const handleUploadRecibos = async () => {
    try {
      setUploading(true);
      for (const file of arquivosSelecionados) {
        const formData = new FormData();
        formData.append("arquivo", file);
        await api.post(`/api/reservas/${reserva.id}/recibos`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      toast.success("Recibo(s) enviados com sucesso!");
      setShowModalInclusaoRecibo(false);
      setArquivosSelecionados([]);
      await carregarRecibos();
    } catch (error) {
      toast.error("Erro ao enviar recibos.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (reciboId, nome) => {
    try {
      setLoadingDownloadId(reciboId);
      const response = await api.get(`/api/arquivos/download/${reciboId}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nome;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Erro ao fazer download do recibo.");
      console.error(err);
    } finally {
      setLoadingDownloadId(null);
    }
  };

  const handleVisualizar = async (reciboId) => {
    try {
      setLoadingViewId(reciboId);
      const response = await api.get(`/api/arquivos/download/${reciboId}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (err) {
      toast.error("Erro ao visualizar recibo.");
      console.error(err);
    } finally {
      setLoadingViewId(null);
    }
  };

  const handleDeleteRecibo = async (reciboId, nome) => {
    try {
      setDeletingId(reciboId);
      await api.delete(`/api/arquivos/${reciboId}`);
      toast.success(`Recibo ${nome} excluído com sucesso!`);
      await carregarRecibos();
    } catch (err) {
      toast.error("Erro ao excluir recibo.");
      console.error(err);
    } finally {
      setDeletingId(null);
      setShowConfirmDelete(null);
    }
  };

  if (loading) return <p>Carregando reserva...</p>;
  if (!reserva) return <p>Reserva não encontrada.</p>;

  const isAprovavel =
    reserva.perfilUsuario === "aprovador" && reserva.statusId === 1;

  const exibeInclusaoRecibo =
    reserva.perfilUsuario === "aprovador" && reserva.statusId === 2;

  return (
    <div className="page-wrapper">
      <PageHeader title="Detalhes da Reserva" />

      <div className={`detalhe-container ${busy ? "busy" : ""}`}>
        {/* ===== HEADER ===== */}
        <div className="detalhe-header">
          <div className="header-left">
            {veioDeLista && (
              <button className="btn-voltar" onClick={() => navigate(-1)}>
                <FaArrowLeft /> Voltar
              </button>
            )}
            <div className="header-info">
              <h2 className="solicitante-nome">
                Colaborador: {reserva.usuarioColaboradorNome}
              </h2>
              <p className="cidade">Cidade: {reserva.cidade}</p>
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

        {/* ===== INFORMAÇÕES ===== */}
        <div className="grid-info">
          <div>
            <strong>Solicitante:</strong>{reserva.usuarioSolicitanteNome}
          </div>
          <div>
            <strong>Data Reserva:</strong>
            {new Date(reserva.dataCriacao).toLocaleDateString("pt-BR")}
          </div>
          <div>
            <strong>Período Reserva:</strong>
            {new Date(reserva.dataInicio).toLocaleDateString("pt-BR")} -{" "}
            {new Date(reserva.dataFim).toLocaleDateString("pt-BR")}
          </div>
          <div>
            <strong>Quantidade de Pessoas:</strong>
            {reserva.quantidadePessoas}
          </div>
          <div>
            <strong>Valor Imóvel:</strong>{" "}
            {reserva.valorImovel.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </div>
          {reserva.valorComTaxa > 0 && (
            <div>
              <strong>Valor Total:</strong>{" "}
              {reserva.valorComTaxa.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </div>
          )}
          <div>
            <strong>Centro De Custo:</strong> {reserva.centroDeCusto}
          </div>
          <div>
            <strong>Anfitrião:</strong> {reserva.nomeAnfitriao}
          </div>
          <div>
            <strong>Telefone:</strong> {reserva.telefoneAnfitriao}
          </div>
          {reserva.codigoReserva && (
            <div>
              <strong>Código Reserva:</strong> {reserva.codigoReserva}
            </div>
          )}
          <div>
            <strong>Link Imóvel:</strong>
            <a
              href={reserva.linkImovel}
              target="_blank"
              rel="noopener noreferrer"
              className="link-imovel"
            >
              Clique Aqui <FaExternalLinkAlt size={12} />
            </a>
          </div>
        </div>

        <div className="motivo">
          <strong>Motivo:</strong>
          <p>{reserva.motivo}</p>
        </div>

        {reserva.observacaoAprovador && (
          <div className="motivo">
            <strong>Observação Aprovador:</strong>
            <p>{reserva.observacaoAprovador}</p>
          </div>
        )}

        {reserva.observacaoExecutor && (
          <div className="motivo">
            <strong>Observação Executor:</strong>
            <p>{reserva.observacaoExecutor}</p>
          </div>
        )}        

        <div className="recibos-section">
          <h3>Recibos Anexados</h3>
          {recibos.length === 0 ? (
            <p className="no-data">Nenhum recibo anexado.</p>
          ) : (
            <table className="notas-table">
              <thead>
                <tr>
                  <th>Nome Arquivo</th>
                  <th>Data Envio</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {recibos.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nome}</td>
                    <td>
                      {new Date(r.dataCriacao).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="acoes">
                      <button
                        className="btn-acao visualizar"
                        title="Visualizar"
                        disabled={loadingViewId === r.id}
                        onClick={() => handleVisualizar(r.id)}
                      >
                        {loadingViewId === r.id ? (
                          <FaSpinner className="spin" />
                        ) : (
                          <FaEye />
                        )}
                      </button>

                      <button
                        className="btn-acao download"
                        title="Download"
                        disabled={loadingDownloadId === r.id}
                        onClick={() => handleDownload(r.id, r.nome)}
                      >
                        {loadingDownloadId === r.id ? (
                          <FaSpinner className="spin" />
                        ) : (
                          <FaDownload />
                        )}
                      </button>

                      <button
                        className="btn-acao delete"
                        title="Excluir"
                        disabled={deletingId === r.id}
                        onClick={() =>
                          setShowConfirmDelete({ id: r.id, nome: r.nome })
                        }
                      >
                        {deletingId === r.id ? (
                          <FaSpinner className="spin" />
                        ) : (
                          <FaTrash />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {isAprovavel && (
          <div className="floating-actions-vertical">
            <button
              className="floating-btn btn-aprovar"
              onClick={() => {
                setDecisaoAprovar(true);
                setShowModal(true);
              }}
              disabled={busy}
            >
              <span className="label">Aprovar</span>
              <FaCheck className="icon" />
            </button>

            <button
              className="floating-btn btn-reprovar"
              onClick={() => {
                setDecisaoAprovar(false);
                setShowModal(true);
              }}
              disabled={busy}
            >
              <span className="label">Reprovar</span>
              <FaTimes className="icon" />
            </button>
          </div>
        )}

        {exibeInclusaoRecibo && (
          <div className="floating-actions-vertical">
            <button
              className="floating-btn btn-recibo"
              onClick={() => setShowModalInclusaoRecibo(true)}
              disabled={busy}
            >
              <span className="label">Incluir Recibos</span>
              <FaFileUpload className="icon" />
            </button>
          </div>
        )}
      </div>

      {/* ===== MODAL DE EXCLUSÃO ===== */}
      {showConfirmDelete && (
        <div className="modal-overlay">
          <div className="modal small">
            <div className="modal-header">
              <h3>Confirmar exclusão</h3>
            </div>
            <div className="modal-body">
              <p>
                Tem certeza que deseja excluir o arquivo{" "}
                <strong>{showConfirmDelete.nome}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancelar"
                onClick={() => setShowConfirmDelete(null)}
                disabled={deletingId === showConfirmDelete.id}
              >
                Não
              </button>
              <button
                className="btn-salvar"
                onClick={() =>
                  handleDeleteRecibo(
                    showConfirmDelete.id,
                    showConfirmDelete.nome
                  )
                }
                disabled={deletingId === showConfirmDelete.id}
              >
                {deletingId === showConfirmDelete.id ? (
                  <>
                    <FaSpinner className="spin" /> Processando...
                  </>
                ) : (
                  "Sim"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DE INCLUSÃO DE RECIBOS ===== */}
      {showModalInclusaoRecibo && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Inclusão de recibos</h3>
              <button
                className="close-btn"
                onClick={() => setShowModalInclusaoRecibo(false)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <input
                type="file"
                multiple
                accept="application/pdf"
                onChange={(e) => setArquivosSelecionados([...e.target.files])}
              />
            </div>

            <div className="modal-footer">
              <button
                className="btn-cancelar"
                onClick={() => setShowModalInclusaoRecibo(false)}
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                className="btn-salvar"
                onClick={handleUploadRecibos}
                disabled={arquivosSelecionados.length === 0 || uploading}
              >
                {uploading ? (
                  <>
                    <FaSpinner className="spin" /> Processando...
                  </>
                ) : (
                  "Salvar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DE OBSERVAÇÃO ===== */}
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
                {decisaoAprovar ? (
                  <>
                    <FaCheck /> Aprovar
                  </>
                ) : (
                  <>
                    <FaTimes /> Reprovar
                  </>
                )}
              </button>
              <button
                className="btn-cancelar"
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
}
