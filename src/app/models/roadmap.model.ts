import { Atividade } from "./atividade.model";

export class Roadmap {
    id!: number;
    titulo!: string;
    descricao!: string;
    atividades!: Atividade[];
    usuarioId!: number;
}