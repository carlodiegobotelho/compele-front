import React, { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";
import {
  FaDownload,
  FaEye,
  FaPlus,
  FaTimes,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";
import api from "../services/api";
import "../styles/InclusaoArquivo.css";

export default function InclusaoArquivo() {
  const [arquivos, setArquivos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [arquivosSelecionados, setArquivosSelecionados] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDownloadId, setLoadingDownloadId] = useState(null);
  const [loadingViewId, setLoadingViewId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, nome } ou null
  const [deleting, setDeleting] = useState(false);

  // === Buscar lista de arquivos ===
  const carregarArquivos = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/arquivos/listar");
      setArquivos(response.data);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarArquivos();
  }, []);

  // === Download arquivo ===
  const handleDownload = async (id, nome) => {
    try {
      setLoadingDownloadId(id);
      const response = await api.get(`/api/arquivos/download/${id}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = nome;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao fazer download:", error);
    } finally {
      setLoadingDownloadId(null);
    }
  };

  const handleVisualizar = async (id) => {
    try {
      setLoadingViewId(id);
      const response = await api.get(`/api/arquivos/download/${id}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank");
    } catch (error) {
      console.error("Erro ao visualizar arquivo:", error);
    } finally {
      setLoadingViewId(null);
    }
  };

  // === Upload de arquivos ===
  const handleUpload = async () => {
    try {
      setUploading(true);
      for (const file of arquivosSelecionados) {
        const formData = new FormData();
        formData.append("arquivo", file);
        await api.post("/api/arquivos/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setShowModal(false);
      setArquivosSelecionados([]);
      await carregarArquivos();
    } catch (error) {
      console.error("Erro ao enviar arquivos:", error);
    } finally {
      setUploading(false);
    }
  };

  // === Exclusão de arquivo ===
  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      await api.delete(`/api/arquivos/${id}`);
      setConfirmDelete(null);
      await carregarArquivos();
    } catch (error) {
      console.error("Erro ao excluir arquivo:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseModal = () => {
    if (!uploading) {
      setShowModal(false);
      setArquivosSelecionados([]);
    }
  };

  return (
    <div className="page-wrapper">
      <PageHeader title="Notas" />

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spin" /> Carregando arquivos...
        </div>
      ) : (
        <div className="table-container">
          <table className="notas-table">
            <thead>
              <tr>
                <th>Nome do Arquivo</th>
                <th>Data Criação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {arquivos.length > 0 ? (
                arquivos.map((arq) => (
                  <tr key={arq.id}>
                    <td>{arq.nome}</td>
                    <td>
                      {new Date(arq.dataCriacao).toLocaleString("pt-BR", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                    <td className="acoes">
                      <button
                        className="btn-acao visualizar"
                        title="Visualizar"
                        disabled={loadingViewId === arq.id}
                        onClick={() => handleVisualizar(arq.id)}
                      >
                        {loadingViewId === arq.id ? (
                          <FaSpinner className="spin" />
                        ) : (
                          <FaEye />
                        )}
                      </button>
                      <button
                        className="btn-acao download"
                        title="Download"
                        disabled={loadingDownloadId === arq.id}
                        onClick={() => handleDownload(arq.id, arq.nome)}
                      >
                        {loadingDownloadId === arq.id ? (
                          <FaSpinner className="spin" />
                        ) : (
                          <FaDownload />
                        )}
                      </button>
                      <button
                        className="btn-acao delete"
                        title="Excluir"
                        onClick={() =>
                          setConfirmDelete({ id: arq.id, nome: arq.nome })
                        }
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data">
                    Nenhum arquivo encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* === Botão Flutuante === */}
      <button
        className="btn-flutuante"
        onClick={() => setShowModal(true)}
        disabled={uploading}
      >
        <FaPlus /> Adicionar Arquivo
      </button>

      {/* === Modal Upload === */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Enviar Arquivos</h3>
              <button className="close-btn" onClick={handleCloseModal}>
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
                onClick={handleCloseModal}
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                className="btn-salvar"
                onClick={handleUpload}
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

      {/* === Modal Confirmação Delete === */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal small">
            <div className="modal-header">
              <h3>Confirmação</h3>
            </div>
            <div className="modal-body">
              <p>
                Tem certeza que deseja excluir o arquivo{" "}
                <strong>{confirmDelete.nome}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-cancelar"
                onClick={() => setConfirmDelete(null)}
                disabled={deleting}
              >
                Não
              </button>
              <button
                className="btn-salvar"
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deleting}
              >
                {deleting ? (
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
    </div>
  );
}
