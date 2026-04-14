export type ProcessoStatus = "ativo" | "arquivado" | "suspenso" | "encerrado";
export type ProcessoTipo =
  | "civel"
  | "criminal"
  | "trabalhista"
  | "previdenciario"
  | "tributario"
  | "administrativo"
  | "familia"
  | "outro";

export interface Processo {
  id: string;
  numero: string;
  cliente: string;
  parteContraria: string;
  tribunal: string;
  vara: string;
  juiz: string;
  tipo: ProcessoTipo;
  status: ProcessoStatus;
  dataAbertura: string;
  descricao: string;
  advogadoResponsavel: string;
  valor?: number;
  createdAt: string;
  updatedAt: string;
}

export type MovimentacaoTipo =
  | "peticao"
  | "audiencia"
  | "despacho"
  | "sentenca"
  | "recurso"
  | "citacao"
  | "intimacao"
  | "acordo"
  | "outro";

export interface Movimentacao {
  id: string;
  processoId: string;
  data: string;
  tipo: MovimentacaoTipo;
  descricao: string;
  documento?: string;
  responsavel: string;
  createdAt: string;
}

export type HonorarioTipo = "fixo" | "exito" | "sucumbencia" | "consulta";
export type HonorarioStatus = "pendente" | "pago" | "vencido" | "cancelado";

export interface Honorario {
  id: string;
  processoId?: string;
  cliente: string;
  tipo: HonorarioTipo;
  valor: number;
  percentual?: number;
  vencimento: string;
  status: HonorarioStatus;
  descricao: string;
  contrato?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Procuracao {
  id: string;
  processoId?: string;
  outorgante: string;
  outorgado: string;
  poderes: string;
  dataEmissao: string;
  dataValidade?: string;
  cartorio?: string;
  livro?: string;
  folha?: string;
  observacoes?: string;
  createdAt: string;
}

export type PrazoTipo =
  | "recursal"
  | "contestacao"
  | "audiencia"
  | "pericia"
  | "manifestacao"
  | "pagamento"
  | "outro";
export type PrazoStatus = "pendente" | "concluido" | "vencido" | "prorrogado";
export type Prioridade = "baixa" | "media" | "alta" | "urgente";

export interface Prazo {
  id: string;
  processoId?: string;
  descricao: string;
  tipo: PrazoTipo;
  dataVencimento: string;
  prioridade: Prioridade;
  status: PrazoStatus;
  responsavel: string;
  observacoes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  nome: string;
  oab: string;
  email: string;
  telefone: string;
  especialidade: string;
  escritorio: string;
  endereco: string;
}

export type KanbanColuna =
  | "backlog"
  | "em_andamento"
  | "revisao"
  | "concluido";

export interface KanbanTarefa {
  id: string;
  titulo: string;
  descricao?: string;
  coluna: KanbanColuna;
  prioridade: Prioridade;
  responsavel?: string;
  processoId?: string;
  prazoId?: string;
  dataVencimento?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}
