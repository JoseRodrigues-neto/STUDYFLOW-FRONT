import { Atividade } from "./atividade.model";
import { Usuario } from "./usuario.model";

export interface Roadmap {
  id: number;
  titulo: string;
  descricao: string;
  atividades: Atividade[];
  usuario: Usuario;
}
