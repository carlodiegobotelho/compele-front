import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import { FaCheckCircle, FaExternalLinkAlt, FaCommentDots, FaSpinner, FaTrash, FaPlus } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import PageHeader from "../components/PageHeader";
import "../styles/SolicitarReserva.css";
import cidades from "../data/cidades";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SolicitarReserva() {
  const hoje = new Date().toISOString().split("T")[0];
  const [loading, setLoading] = useState(false);

  // ✅ lista dinâmica de colaboradores
  const [colaboradores, setColaboradores] = useState([
    { nomeColaborador: "", emailColaborador: "" },
  ]);

  const [form, setForm] = useState({
    dataInicio: hoje,
    dataFim: hoje,
    cidade: "",
    nomeAnfitriao: "",
    telefoneAnfitriao: "",
    linkImovel: "",
    valorImovel: "",
    centroDeCusto: "",
    motivo: "",
    observacao: "",
  });

  const cidadesOptions = React.useMemo(() => {
    const unique = Array.from(new Set(cidades));
    return unique.sort(new Intl.Collator("pt-BR").compare);
  }, [cidades]);

  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState(10);
  const navigate = useNavigate();

  useEffect(() => {
    let countdown;
    if (showModal && timer > 0) {
      countdown = setInterval(() => setTimer((t) => t - 1), 1000);
    } else if (showModal && timer === 0) {
      navigate("/minhas-solicitacoes");
    }
    return () => clearInterval(countdown);
  }, [showModal, timer, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleMoneyChange = (e) => {
    const { name, value } = e.target;
    const num = value.replace(/\D/g, "");
    const formatted = (Number(num) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    setForm((prev) => ({ ...prev, [name]: formatted }));
  };

  // ✅ colaboradores handlers
  const handleColaboradorChange = (index, field, value) => {
    setColaboradores((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleAddColaborador = () => {
    setColaboradores((prev) => [
      ...prev,
      { nomeColaborador: "", emailColaborador: "" },
    ]);
  };

  const handleRemoveColaborador = (index) => {
    // ✅ não remove a última linha
    setColaboradores((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, i) => i !== index);
      return next.length ? next : prev;
    });
  };

  const validarColaboradores = () => {
    if (!colaboradores || colaboradores.length === 0) {
      toast.error("Inclua pelo menos 1 colaborador.");
      return false;
    }

    for (let i = 0; i < colaboradores.length; i++) {
      const nome = (colaboradores[i].nomeColaborador || "").trim();
      const email = (colaboradores[i].emailColaborador || "").trim();

      if (!nome) {
        toast.error(`Informe o nome do colaborador (linha ${i + 1}).`);
        return false;
      }
      if (!email || !EMAIL_REGEX.test(email)) {
        toast.error(`Informe um e-mail válido (linha ${i + 1}).`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarColaboradores()) return;

    setLoading(true);

    try {
      const toDecimal = (v) =>
        Number((v || "").replace(/[R$\s.]/g, "").replace(",", ".")) || 0;

      const primeiro = colaboradores[0];

      const payload = {
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        cidade: form.cidade,

        // ✅ raiz recebe o primeiro colaborador
        nomeColaborador: (primeiro.nomeColaborador || "").trim(),
        emailColaborador: (primeiro.emailColaborador || "").trim(),

        nomeAnfitriao: form.nomeAnfitriao,
        telefoneAnfitriao: form.telefoneAnfitriao,
        linkImovel: form.linkImovel,
        valorImovel: toDecimal(form.valorImovel),
        centroDeCusto: form.centroDeCusto,

        // ✅ quantidade automática
        quantidadePessoas: colaboradores.length,

        motivo: form.motivo,
        observacao: form.observacao,

        // ✅ novo campo
        colaboradores: colaboradores.map((c) => ({
          nomeColaborador: (c.nomeColaborador || "").trim(),
          emailColaborador: (c.emailColaborador || "").trim(),
        })),
      };

      await api.post("/api/reservas", payload);

      setShowModal(true);
      setTimer(10);

      // reset
      setColaboradores([{ nomeColaborador: "", emailColaborador: "" }]);
      setForm({
        dataInicio: hoje,
        dataFim: "",
        cidade: "",
        nomeAnfitriao: "",
        telefoneAnfitriao: "",
        linkImovel: "",
        valorImovel: "",
        centroDeCusto: "",
        motivo: "",
        observacao: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.erros?.[0] ||
          "Erro ao enviar solicitação. Verifique os campos digitados e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const quantidadePessoas = colaboradores.length;

  return (
    <div className="page-wrapper">
      <PageHeader title="Solicitar Reserva" />

      <form className="form-reserva" onSubmit={handleSubmit}>
        {/* ✅ COLABORADORES (dinâmico) */}
        {colaboradores.map((c, idx) => {
          const podeRemover = colaboradores.length > 1;
          return (
            <div className="form-row" key={idx}>
              <div className="form-group colaboradores">
                <label>{"Nome do Colaborador " + (idx + 1) + " *"}</label>
                <input
                  type="text"
                  value={c.nomeColaborador}
                  onChange={(e) =>
                    handleColaboradorChange(idx, "nomeColaborador", e.target.value)
                  }
                  required
                  placeholder="Digite o nome do colaborador"
                />
              </div>

              <div className="form-group colaboradores">
                <label>{"Email do Colaborador " + (idx + 1) + " *"}</label>
                <input
                  type="email"
                  value={c.emailColaborador}
                  onChange={(e) =>
                    handleColaboradorChange(idx, "emailColaborador", e.target.value)
                  }
                  required
                  placeholder="colaborador@dominio.com"
                />
              </div>

              <div className="form-group form-group-icon">
                <label className="sr-only">Remover</label>
                <button
                  type="button"
                  className={`btn-remove-colaborador ${!podeRemover ? "disabled" : ""}`}
                  onClick={() => handleRemoveColaborador(idx)}
                  disabled={!podeRemover}
                  title={!podeRemover ? "Não é possível remover o último colaborador" : "Remover colaborador"}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          );
        })}

        <div className="form-row">
          <div className="form-group">
            <button
              type="button"
              className="btn-add-colaborador"
              onClick={handleAddColaborador}
              disabled={loading}
            >
              <FaPlus /> Incluir Colaborador
            </button>
          </div>
        </div>

        {/* datas */}
        <div className="form-row">
          <div className="form-group">
            <label>Data Início *</label>
            <input
              type="date"
              name="dataInicio"
              value={form.dataInicio}
              onChange={handleChange}
              min={hoje}
              required
            />
          </div>

          <div className="form-group">
            <label>Data Fim *</label>
            <input
              type="date"
              name="dataFim"
              value={form.dataFim}
              onChange={handleChange}
              min={form.dataInicio}
              required
            />
          </div>
        </div>

        {/* cidade + qtd */}
        <div className="form-row">
          <div className="form-group">
            <label>Cidade *</label>
            <input
              type="text"
              name="cidade"
              value={form.cidade}
              onChange={handleChange}
              list="listaCidadesBR"
              placeholder="Digite ou selecione"
              autoComplete="on"
              required
            />
            <datalist id="listaCidadesBR">
              {cidadesOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>

          <div className="form-group">
            <label>Quantidade de Pessoas *</label>
            <input
              type="number"
              name="quantidadePessoas"
              value={quantidadePessoas}
              disabled
              readOnly
              min="1"
              title="Preenchido automaticamente pela quantidade de colaboradores"
            />
          </div>
        </div>

        {/* valor + cc */}
        <div className="form-row">
          <div className="form-group">
            <label>Valor do Imóvel*</label>
            <input
              type="text"
              name="valorImovel"
              value={form.valorImovel}
              onChange={handleMoneyChange}
              placeholder="R$ 0,00"
              required
            />
          </div>

          <div className="form-group">
            <label>Centro de Custo *</label>
            <input
              type="text"
              name="centroDeCusto"
              value={form.centroDeCusto}
              onChange={handleChange}
              placeholder="Digite o centro de custo"
              required
            />
          </div>
        </div>

        {/* anfitrião */}
        <div className="form-row">
          <div className="form-group">
            <label>Nome do Anfitrião</label>
            <input
              type="text"
              name="nomeAnfitriao"
              value={form.nomeAnfitriao}
              onChange={handleChange}
              placeholder="Digite o nome do anfitrião"
            />
          </div>

          <div className="form-group">
            <label>Telefone do Anfitrião</label>
            <input
              type="tel"
              name="telefoneAnfitriao"
              value={form.telefoneAnfitriao}
              onChange={handleChange}
              placeholder="(99) 99999-9999"
            />
          </div>
        </div>

        {/* link + motivo */}
        <div className="form-row">
          <div className="form-group">
            <label>Link do Imóvel *</label>
            <div className="input-with-action">
              <input
                type="url"
                name="linkImovel"
                value={form.linkImovel}
                onChange={handleChange}
                placeholder="https://..."
                required
              />
              {form.linkImovel && /^https?:\/\/.+\..+/.test(form.linkImovel) && (
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => window.open(form.linkImovel, "_blank")}
                  title="Abrir link do imóvel"
                >
                  <FaExternalLinkAlt />
                </button>
              )}
            </div>
          </div>

          <div className="form-group">
            <label>Motivo da Viagem</label>
            <div className="input-with-action">
              <input
                name="motivo"
                value={form.motivo}
                onChange={handleChange}
                type="text"
                placeholder="Descreva o motivo da reserva"
              />
              {form.motivo && (
                <div className="tooltip-container-motivo">
                  <FaCommentDots className="tooltip-icon-motivo" />
                  <span className="tooltip-text-motivo">{form.motivo}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* observação */}
        <div className="form-row">
          <div className="form-group">
            <label>Observação</label>
            <input
              type="text"
              name="observacao"
              value={form.observacao}
              onChange={handleChange}
              placeholder="Digite observações sobre a viagem"
            />
          </div>
        </div>

        <button type="submit" className="btn-enviar" disabled={loading}>
          {loading ? (
            <>
              <FaSpinner className="spin" /> Enviando...
            </>
          ) : (
            "Enviar Solicitação"
          )}
        </button>
      </form>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <FaCheckCircle className="success-icon" />
            <h3>Reserva solicitada com sucesso!</h3>
            <button
              className="btn-ver-solicitacoes"
              onClick={() => navigate("/minhas-solicitacoes")}
            >
              Ver minhas solicitações ({timer})
              <div
                className="timer-bar"
                style={{ width: `${(10 - timer) * 10}%` }}
              ></div>
            </button>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" />
    </div>
  );
}
