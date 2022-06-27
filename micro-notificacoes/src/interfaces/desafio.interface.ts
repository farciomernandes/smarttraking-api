import { DesafioStatus } from "src/desafio-status.enum";


export interface Desafio {

    dataHoradesafio: Date;
    status: DesafioStatus;
    dataHoraSolicitacao: Date;
    dataHoraResposta?: Date;
    solicitante: string;
    categoria: string;
    partida?: string;
    jogadores: string[];
}