// Representa uma única série dentro de uma barra (ex: "Concluído" com valor 5)
export interface SerieGrafico {
  nome: string;
  valor: number;
} 
export interface DadosGraficoBarra {
  nome: string;
  series: SerieGrafico[];
}


// models/dashboard-data.model.ts
export interface DashboardApiResponse {
  total: number;
  concluidas: number;
  pendentes: number;
  emAndamento: number;
  algumaCoisa1?: number;
  statusCounts: { [k: string]: number };
  algumaCoisa2?: number;
  roadmaps: ApiRoadmapResumo[];    // pode estar vazio
  outraCoisa: { [k: string]: number };   // atividades criadas por mês (yyyy-MM)
  outraCoisa2: { [k: string]: number };  // atividades concluídas por mês (yyyy-MM)
  usuario?: {
    nome?: string;
    email?: string;
    avatarUrl?: string | null;
  } | null;
}

export interface ApiRoadmapResumo {
  // dependendo do backend pode ter id; tratar como any no mapping
  id?: number;
  titulo: string;
  total?: number;
  concluidas?: number;
}

/**
 * Model usado internamente no front (nomes mais amigáveis)
 */
export interface DashboardData {
  total: number;
  concluidas: number;
  pendentes: number;
  emAndamento: number;
  statusCounts: { [k: string]: number };
  roadmaps: RoadmapResumo[];
  atividadesCriadasPorMes: { [mes: string]: number };
  atividadesConcluidasPorMes: { [mes: string]: number };
  usuario?: {
    nome?: string;
    email?: string;
    avatarUrl?: string | null;
  } | null;
}

export interface RoadmapResumo {
  id?: number;
  titulo: string;
  total: number;
  concluidas: number;
}
