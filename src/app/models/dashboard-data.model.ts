// Representa uma única série dentro de uma barra (ex: "Concluído" com valor 5)
export interface SerieGrafico {
  nome: string;
  valor: number;
}

 
export interface DadosGraficoBarra {
  nome: string;
  series: SerieGrafico[];
}

 
export interface DashboardData {
  totalAtividades: number;
  atividadesConcluidas: number;
  atividadesPendentes: number;
  atividadesEmAndamento: number;
  statusCounts: { [key: string]: number };
  progressoPorRoadmap: DadosGraficoBarra[];  
}