import api from "./api";

export async function obterDetalhesUsuario(id) {
  const response = await api.get(`/api/usuarios/${id}`);
  return response.data;
}