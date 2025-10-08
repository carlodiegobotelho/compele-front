import React, { useState, useEffect } from "react";
import api from "../services/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/SolicitarReserva.css";
import { salvarReserva, obterSolicitacoes } from '../services/reservaService'

export default function SolicitarReserva() {
  const hoje = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    dataInicio: hoje,
    dataFim: "",
    cidade: "",
    motivo: "",
    tipoReserva: "1",
    quantidadePessoas: 1,
  });
  const [showModal, setShowModal] = useState(false);
  const [timer, setTimer] = useState(10);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await salvarReserva({
        dataInicio: form.dataInicio,
        dataFim: form.dataFim,
        cidade: form.cidade,
        motivo: form.motivo,
        tipoReserva: parseInt(form.tipoReserva),
        quantidadePessoas: parseInt(form.quantidadePessoas),
      });

        toast.success("Reserva solicitada com sucesso!");

        setShowModal(true);

      setForm({
        dataInicio: hoje,
        dataFim: "",
        cidade: "",
        motivo: "",
        tipoReserva: "1",
        quantidadePessoas: 1,
      });
      var a1 = await obterSolicitacoes();
      console.log(a1)
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.erros?.[0] || "Erro ao solicitar reserva"
      );
    }
  };

  const cidades = [
    "Belém", "Belo Horizonte", "Blumenau", "Boa Vista", "Brasília", "Campinas", "Campo Grande",
    "Cascavel", "Curitiba", "Feira de Santana", "Florianópolis", "Fortaleza", "Goiânia",
    "Guarulhos", "Joinville", "Londrina", "Macapá", "Maceió", "Manaus", "Maringá", "Natal",
    "Niterói", "Osasco", "Palmas", "Porto Alegre", "Recife", "Ribeirão Preto", "Rio de Janeiro",
    "Salvador", "Santos", "São Bernardo do Campo", "São Gonçalo", "São José dos Campos",
    "São Luís", "São Paulo", "Sorocaba", "Teresina", "Uberlândia", "Vitória", "Volta Redonda",
  ].sort();

  useEffect(() => {
        let countdown;
        if (showModal && timer > 0) {
            countdown = setInterval(() => setTimer((t) => t - 1), 1000);
        } else if (showModal && timer === 0) {
            handleConfirm(); // executa automaticamente o SIM
        }
        return () => clearInterval(countdown);
    }, [showModal, timer]);

    const handleConfirm = () => {
        setShowModal(false);
        window.location.href = "/principal"; // navega pra principal
    };

    const handleCancel = () => {
        setShowModal(false);
        setForm({
            dataInicio: hoje,
            dataFim: "",
            cidade: "",
            motivo: "",
            tipoReserva: "1",
            quantidadePessoas: 1,
        });
        setTimer(10);
    };


  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1>Solicitar Reserva</h1>
        <div className="header-line" />
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Data Início</label>
          <input
            type="date"
            name="dataInicio"
            value={form.dataInicio}
            min={hoje}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Data Fim</label>
          <input
            type="date"
            name="dataFim"
            value={form.dataFim}
            min={form.dataInicio || hoje}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group full-width">
        </div>

        <div className="form-group full-width">
          <label>Cidade</label>
          <input
            list="listaCidades"
            name="cidade"
            value={form.cidade}
            onChange={handleChange}
            placeholder="Selecione ou digite uma cidade"
            required
          />
          <datalist id="listaCidades">
            {cidades.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div className="form-group full-width">
        </div>
        <div className="form-group">
        </div>

        <div className="form-group">
          <label>Tipo de Reserva</label>
          <select
            name="tipoReserva"
            value={form.tipoReserva}
            onChange={handleChange}
            required
          >
            <option value="1">Nova</option>
            <option value="2">Renovação</option>
          </select>
        </div>

        <div className="form-group">
          <label>Quantidade de Pessoas</label>
          <input
            type="number"
            name="quantidadePessoas"
            min="1"
            value={form.quantidadePessoas}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group full-width">
        </div>
        <div className="form-group full-width">
            <label>Motivo</label>
            <textarea
                name="motivo"
                rows="3"
                value={form.motivo}
                onChange={handleChange}
                required
            />
        </div>
        <div className="form-group full-width">
        </div>
        <div className="form-group">
        </div>
        <div className="form-actions">
          <button type="submit">Enviar Solicitação</button>
        </div>
      </form>
      <ToastContainer position="top-right" />
      {showModal && (
        <div className="modal-overlay">
            <div className="modal-content">
            <h3>Solicitação de reserva efetuada!</h3>
            <p>Deseja retornar para a tela principal?</p>

            <div className="modal-buttons">
                <button className="btn-cancel" onClick={handleCancel}>Não</button>
                <button className="btn-confirm" onClick={handleConfirm}>
                Sim
                <div
                    className="timer-bar"
                    style={{ width: `${(10 - timer) * 10}%` }}
                ></div>
                </button>
            </div>
            </div>
        </div>
        )}
    </div>
  );
}
