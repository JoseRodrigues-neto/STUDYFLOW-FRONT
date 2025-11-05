import { Atividade } from "./atividade.model";

export class Anotacao{
    id!: number;
    conteudo!: string;
    atividade!: Atividade;
}