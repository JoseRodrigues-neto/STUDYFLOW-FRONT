import { Anotacao } from "./anotacao.model";
import { StatusAtividade } from "./status-atividade.model";

export class Atividade{
    id!: number
    titulo!: string
    descricao!: string
    dataInicio!: Date;
    dataFim!: Date;
    status!: StatusAtividade;
    anotacoes!: Anotacao[];
    roadmapId!: number;
}