import api from "./api";

export async function salvarReserva(data) {
  const response = await api.post("/api/reservas", data);
  return response.data;
}

export async function obterSolicitacoes() {
  const response = await api.get("/api/reservas/minhas-solicitacoes");
  return response.data;
}