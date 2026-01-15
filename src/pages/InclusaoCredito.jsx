import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "../components/PageHeader";
import { FaPlus, FaTimes, FaTrash, FaSpinner, FaMoneyBillWave } from "react-icons/fa";
import api from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "../styles/InclusaoCredito.css";

export default function InclusaoCredito() {
  const [extrato, setExtrato] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [usuario, setUsuario] = useState(null)

  const [form, setForm] = useState({
    operacao: "1",
    codigoReserva: "",
    valorOperacao: "",
  });

  const formatCurrency = (num) =>
    Number(num || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
    });

  const isCredito = (op) =>
    String(op || "").toLowerCase().includes("cr");

  // === Buscar extrato (ordenado por dataCriacao desc) ===
  const carregarExtrato = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/extrato");

      const lista = Array.isArray(response.data) ? response.data : [];
      lista.sort((a, b) => new Date(b.dataCriacao) - new Date(a.dataCriacao));

      setExtrato(lista);
    } catch (error) {
      console.error("Erro ao carregar o extrato:", error);
      toast.error("Erro ao carregar o extrato.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarExtrato();
    const userData = localStorage.getItem('Compele-DadosUsuario');

    if (userData) {
      setUsuario(JSON.parse(userData))
    }
  }, []);

  const isAdmin = usuario?.perfil === "Admin";

  // === Saldo acumulado ===
  const saldo = useMemo(() => {
    return extrato.reduce((acc, r) => {
      const valor = Number(r.valor) || 0;
      return acc + (isCredito(r.operacao) ? valor : -valor);
    }, 0);
  }, [extrato]);

  // === Exclusão ===
  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      await api.delete(`/api/extrato/operacao/${id}`);
      setConfirmDelete(null);
      await carregarExtrato();
      toast.success("Registro excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir registro:", error);
      toast.error("Erro ao excluir registro.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCloseModal = () => {
    if (!uploading) setShowModal(false);
  };

  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    const num = value.replace(/\D/g, "");
    const formatted = (Number(num) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    setForm({ ...form, [name]: formatted });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // === Submit inclusão ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      const toDecimal = (v) =>
        Number(String(v).replace(/[R$\s.]/g, "").replace(",", ".")) || 0;

      const payload = {
        operacao: Number(form.operacao),
        valorOperacao: toDecimal(form.valorOperacao),
        codigoReserva: form.codigoReserva,
      };

      await api.post("/api/extrato/operacoes", payload);

      setShowModal(false);
      setForm({
        operacao: "1",
        codigoReserva: "",
        valorOperacao: "",
      });

      await carregarExtrato();
      toast.success("Operação registrada com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.erros?.[0] ||
          "Erro ao enviar solicitação. Verifique os campos digitados e tente novamente."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="page-wrapper">
      <PageHeader title="Extrato de Créditos" />

        {/* Saldo acumulado */}
        <div className="saldo-card">
        <FaMoneyBillWave className="saldo-icon" />
        <div className="saldo-info">
            <span className="saldo-label">Saldo acumulado</span>
            <strong className={`saldo-valor ${saldo >= 0 ? "pos" : "neg"}`}>
            {formatCurrency(saldo)}
            </strong>
        </div>
        </div>

      {loading ? (
        <div className="loading-container">
          <FaSpinner className="spin" /> Carregando Extrato...
        </div>
      ) : (
        <div className="table-container">
          <table className="notas-table">
            <thead>
              <tr>
                <th>Operação</th>
                <th>Data Criação</th>
                <th>Detalhes</th>
                <th>Código Reserva</th>
                <th>Valor</th>
                {isAdmin && <th style={{ width: 90 }}>Ações</th>}
              </tr>
            </thead>

            <tbody>
              {extrato.length > 0 ? (
                extrato.map((registro) => {
                  const credito = isCredito(registro.operacao);

                  return (
                    <tr key={registro.id}>
                      <td>
                        <span
                          className={`op-badge ${
                            credito ? "credito" : "debito"
                          }`}
                        >
                          {registro.operacao}
                        </span>
                      </td>

                      <td>
                        {new Date(registro.dataCriacao)
                          .toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                          .replace(",", "")}
                      </td>

                      <td>
                        {credito ? "Crédito gerado por estorno da reserva" : "Saldo utilizado em reserva"}
                      </td>

                      <td>{registro.codigoReserva}</td>

                      <td className={credito ? "valor-credito" : "valor-debito"}>
                        {credito ? "" : "- "}
                        {formatCurrency(registro.valor)}
                      </td>
                        {isAdmin && (
                            <td className="acoes">
                                <button
                                className="btn-acao delete"
                                disabled={deleting || uploading}
                                onClick={() =>
                                    setConfirmDelete({
                                    id: registro.id,
                                    nome: registro.codigoReserva,
                                    })
                                }
                                >
                                <FaTrash />
                                </button>
                            </td>
                        )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                    <td colSpan={!isAdmin ? 4 : 5} className="no-data">
                    Nenhum registro encontrado
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

        {isAdmin && (
        <button
            className="btn-flutuante"
            onClick={() => setShowModal(true)}
            disabled={uploading}
        >
            <FaPlus /> Adicionar
        </button>
        )}


      {/* Modal inclusão */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Inclusão de Crédito / Débito</h3>
              <button className="close-btn" onClick={handleCloseModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Operação *</label>
                <select
                  style={{ marginBottom: "20px" }}
                  name="operacao"
                  value={form.operacao}
                  onChange={handleChange}
                >
                  <option value="1">Crédito</option>
                  <option value="2">Débito</option>
                </select>
              </div>

              <div className="form-group">
                <label>Código Reserva *</label>
                <input
                  type="text"
                  name="codigoReserva"
                  value={form.codigoReserva}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Valor *</label>
                <input
                  type="text"
                  name="valorOperacao"
                  value={form.valorOperacao}
                  onChange={handleMoneyChange}
                  placeholder="R$ 0,00"
                  required
                />
              </div>
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
                onClick={handleSubmit}
                disabled={
                  uploading ||
                  !form.codigoReserva.trim() ||
                  !form.valorOperacao.trim()
                }
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

      {/* Modal confirmação delete */}
      {confirmDelete && (
        <div className="modal-overlay">
          <div className="modal small">
            <div className="modal-header">
              <h3>Confirmação</h3>
            </div>
            <div className="modal-body">
              <p>
                Tem certeza que deseja excluir o registro?
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

      <ToastContainer position="top-right" />
    </div>
  );
}
