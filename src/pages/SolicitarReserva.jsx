import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import { FaCheckCircle } from "react-icons/fa";
import "react-toastify/dist/ReactToastify.css";
import PageHeader from "../components/PageHeader";
import "../styles/SolicitarReserva.css";
import cidades from "../data/cidades";

export default function SolicitarReserva() {
  const hoje = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    dataInicio: hoje,
    dataFim: hoje,
    cidade: "",
    nomeAnfitriao: "",
    telefoneAnfitriao: "",
    linkImovel: "",
    valorImovel: "",
    valorReal: "",
    valorComTaxa: "",
    tipoReserva: "1",
    quantidadePessoas: 1,
    motivo: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const toDecimal = (v) =>
      Number(v.replace(/[R$\s.]/g, "").replace(",", ".")) || 0;

    const payload = {
      dataInicio: form.dataInicio,
      dataFim: form.dataFim,
      cidade: form.cidade,
      nomeAnfitriao: form.nomeAnfitriao,
      telefoneAnfitriao: form.telefoneAnfitriao,
      linkImovel: form.linkImovel,
      valorImovel: toDecimal(form.valorImovel),
      valorReal: toDecimal(form.valorReal),
      valorComTaxa: toDecimal(form.valorComTaxa),
      tipoReserva: Number(form.tipoReserva),
      quantidadePessoas: Number(form.quantidadePessoas),
      motivo: form.motivo,
    };

    try {
      await api.post("/api/reservas", payload);

      setShowModal(true);
      setTimer(10);

      setForm({
        dataInicio: hoje,
        dataFim: "",
        cidade: "",
        nomeAnfitriao: "",
        telefoneAnfitriao: "",
        linkImovel: "",
        valorImovel: "",
        valorReal: "",
        valorComTaxa: "",
        tipoReserva: "1",
        quantidadePessoas: 1,
        motivo: "",
      });
    } catch (err) {
      toast.error("Erro ao enviar solicitação. Verifique os campos.");
    }
  };

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
  }, [showModal, timer]);

  return (
    <div className="page-wrapper">
      <PageHeader title="Solicitar Reserva" />

      <form className="form-reserva" onSubmit={handleSubmit}>
        {/* Linha 1 */}
        <div className="form-row">
          <div className="form-group">
            <label>Data Início</label>
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
            <label>Data Fim</label>
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

        {/* Linha 2 */}
        <div className="form-row">
          <div className="form-group">
            <label>Cidade</label>
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
            <label>Quantidade de Pessoas</label>
            <input
              type="number"
              name="quantidadePessoas"
              value={form.quantidadePessoas}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
        </div>

        {/* Linha 3 */}
        <div className="form-row">
          <div className="form-group">
            <label>Nome do Anfitrião</label>
            <input
              type="text"
              name="nomeAnfitriao"
              value={form.nomeAnfitriao}
              onChange={handleChange}
              required
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
              required
            />
          </div>


        </div>

        {/* Linha 4 */}
        <div className="form-row">
          <div className="form-group">
            <label>Valor do Imóvel</label>
            <input
              type="text"
              name="valorImovel"
              value={form.valorImovel}
              onChange={handleMoneyChange}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="form-group">
            <label>Valor Real</label>
            <input
              type="text"
              name="valorReal"
              value={form.valorReal}
              onChange={handleMoneyChange}
              placeholder="R$ 0,00"
            />
          </div>
        </div>

        {/* Linha 5 */}
        <div className="form-row">
          <div className="form-group">
            <label>Valor com Taxa</label>
            <input
              type="text"
              name="valorComTaxa"
              value={form.valorComTaxa}
              onChange={handleMoneyChange}
              placeholder="R$ 0,00"
            />
          </div>

          <div className="form-group">
            <label>Tipo de Reserva</label>
            <select
              name="tipoReserva"
              value={form.tipoReserva}
              onChange={handleChange}
            >
              <option value="1">Nova</option>
              <option value="2">Renovação</option>
            </select>
          </div>
        </div>

        {/* Linha 6 */}
        <div className="form-row">
          <div className="form-group">
            <label>Link do Imóvel</label>
            <input
              type="url"
              name="linkImovel"
              value={form.linkImovel}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Linha 7 */}
        <div className="form-group">
          <label>Motivo</label>
          <textarea
            name="motivo"
            value={form.motivo}
            onChange={handleChange}
            rows="4"
            required
          ></textarea>
        </div>

        <button type="submit" className="btn-enviar">
          Enviar Solicitação
        </button>
      </form>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <FaCheckCircle className="success-icon" />
            <h3>Reserva solicitada com sucesso!</h3>
            <button className="btn-ver-solicitacoes" onClick={() => navigate("/minhas-solicitacoes")}>
              Ver minhas solicitações ({timer})
              <div className="timer-bar" style={{ width: `${(10 - timer) * 10}%` }}></div>
            </button>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" />
    </div>
  );
}
