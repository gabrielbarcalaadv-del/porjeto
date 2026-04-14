"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Processo,
  Movimentacao,
  Honorario,
  Procuracao,
  Prazo,
  KanbanTarefa,
  UserProfile,
} from "./types";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

const now = () => new Date().toISOString();

interface AppState {
  userProfile: UserProfile;
  updateUserProfile: (p: Partial<UserProfile>) => void;

  processos: Processo[];
  movimentacoes: Movimentacao[];
  honorarios: Honorario[];
  procuracoes: Procuracao[];
  prazos: Prazo[];
  tarefas: KanbanTarefa[];

  // Processos
  addProcesso: (p: Omit<Processo, "id" | "createdAt" | "updatedAt">) => void;
  updateProcesso: (id: string, p: Partial<Processo>) => void;
  deleteProcesso: (id: string) => void;

  // Movimentações
  addMovimentacao: (m: Omit<Movimentacao, "id" | "createdAt">) => void;
  updateMovimentacao: (id: string, m: Partial<Movimentacao>) => void;
  deleteMovimentacao: (id: string) => void;

  // Honorários
  addHonorario: (h: Omit<Honorario, "id" | "createdAt" | "updatedAt">) => void;
  updateHonorario: (id: string, h: Partial<Honorario>) => void;
  deleteHonorario: (id: string) => void;

  // Procurações
  addProcuracao: (p: Omit<Procuracao, "id" | "createdAt">) => void;
  updateProcuracao: (id: string, p: Partial<Procuracao>) => void;
  deleteProcuracao: (id: string) => void;

  // Prazos
  addPrazo: (p: Omit<Prazo, "id" | "createdAt" | "updatedAt">) => void;
  updatePrazo: (id: string, p: Partial<Prazo>) => void;
  deletePrazo: (id: string) => void;

  // Kanban
  addTarefa: (t: Omit<KanbanTarefa, "id" | "createdAt" | "updatedAt">) => void;
  updateTarefa: (id: string, t: Partial<KanbanTarefa>) => void;
  deleteTarefa: (id: string) => void;
  moveTarefa: (id: string, coluna: KanbanTarefa["coluna"]) => void;
}

const defaultUserProfile: UserProfile = {
  nome: "Dr. João Paulo Ferreira",
  oab: "OAB/SP 123456",
  email: "joaopaulo@jurisoffice.com.br",
  telefone: "(11) 99999-0000",
  especialidade: "Direito Civil e Trabalhista",
  escritorio: "Ferreira & Associados Advocacia",
  endereco: "Av. Paulista, 1000 - São Paulo/SP",
};

const sampleData = {
  processos: [
    {
      id: "p1",
      numero: "0001234-56.2024.8.26.0001",
      cliente: "Maria Silva Santos",
      parteContraria: "Banco Nacional S.A.",
      tribunal: "TJSP",
      vara: "3ª Vara Cível",
      juiz: "Dr. Carlos Eduardo Moreira",
      tipo: "civel" as const,
      status: "ativo" as const,
      dataAbertura: "2024-03-15",
      descricao: "Ação de indenização por danos morais e materiais",
      advogadoResponsavel: "Dr. João Paulo Ferreira",
      valor: 25000,
      createdAt: "2024-03-15T10:00:00Z",
      updatedAt: "2024-03-15T10:00:00Z",
    },
    {
      id: "p2",
      numero: "0009876-12.2024.5.15.0001",
      cliente: "Roberto Carlos Oliveira",
      parteContraria: "Empresa XYZ Ltda.",
      tribunal: "TRT15",
      vara: "1ª Vara do Trabalho",
      juiz: "Dra. Ana Lucia Barbosa",
      tipo: "trabalhista" as const,
      status: "ativo" as const,
      dataAbertura: "2024-01-20",
      descricao: "Reclamação trabalhista - verbas rescisórias",
      advogadoResponsavel: "Dra. Patricia Lima",
      valor: 42000,
      createdAt: "2024-01-20T09:00:00Z",
      updatedAt: "2024-01-20T09:00:00Z",
    },
    {
      id: "p3",
      numero: "0004321-98.2023.8.26.0001",
      cliente: "Empresa ABC Ltda.",
      parteContraria: "Prefeitura Municipal",
      tribunal: "TJSP",
      vara: "2ª Vara da Fazenda Pública",
      juiz: "Dr. Fernando Mendes",
      tipo: "tributario" as const,
      status: "suspenso" as const,
      dataAbertura: "2023-11-05",
      descricao: "Mandado de segurança - IPTU indevido",
      advogadoResponsavel: "Dr. João Paulo Ferreira",
      valor: 78000,
      createdAt: "2023-11-05T14:00:00Z",
      updatedAt: "2023-11-05T14:00:00Z",
    },
  ] as Processo[],
  movimentacoes: [
    {
      id: "m1",
      processoId: "p1",
      data: "2024-04-10",
      tipo: "peticao" as const,
      descricao: "Petição inicial protocolada com todos os documentos",
      responsavel: "Dr. João Paulo Ferreira",
      createdAt: "2024-04-10T10:00:00Z",
    },
    {
      id: "m2",
      processoId: "p1",
      data: "2024-04-12",
      tipo: "despacho" as const,
      descricao: "Despacho determinando citação da parte ré",
      responsavel: "Dr. Carlos Eduardo Moreira",
      createdAt: "2024-04-12T14:00:00Z",
    },
    {
      id: "m3",
      processoId: "p2",
      data: "2024-04-05",
      tipo: "audiencia" as const,
      descricao: "Audiência de conciliação realizada sem acordo",
      responsavel: "Dra. Patricia Lima",
      createdAt: "2024-04-05T09:00:00Z",
    },
  ] as Movimentacao[],
  honorarios: [
    {
      id: "h1",
      processoId: "p1",
      cliente: "Maria Silva Santos",
      tipo: "fixo" as const,
      valor: 3000,
      vencimento: "2024-05-15",
      status: "pendente" as const,
      descricao: "Honorários mensais - Processo cível",
      createdAt: "2024-03-15T10:00:00Z",
      updatedAt: "2024-03-15T10:00:00Z",
    },
    {
      id: "h2",
      processoId: "p2",
      cliente: "Roberto Carlos Oliveira",
      tipo: "exito" as const,
      valor: 8400,
      percentual: 20,
      vencimento: "2024-07-01",
      status: "pendente" as const,
      descricao: "Honorários de êxito - 20% sobre condenação",
      createdAt: "2024-01-20T09:00:00Z",
      updatedAt: "2024-01-20T09:00:00Z",
    },
  ] as Honorario[],
  procuracoes: [
    {
      id: "proc1",
      processoId: "p1",
      outorgante: "Maria Silva Santos",
      outorgado: "Dr. João Paulo Ferreira OAB/SP 123456",
      poderes: "Ad judicia et extra, com poderes para receber citação, confessar, transigir, desistir, receber e dar quitação",
      dataEmissao: "2024-03-14",
      cartorio: "3º Cartório de Notas",
      observacoes: "Procuração com poderes amplos",
      createdAt: "2024-03-14T10:00:00Z",
    },
  ] as Procuracao[],
  prazos: [
    {
      id: "pr1",
      processoId: "p1",
      descricao: "Prazo para contestação",
      tipo: "contestacao" as const,
      dataVencimento: "2024-05-20",
      prioridade: "alta" as const,
      status: "pendente" as const,
      responsavel: "Dr. João Paulo Ferreira",
      createdAt: "2024-04-12T10:00:00Z",
      updatedAt: "2024-04-12T10:00:00Z",
    },
    {
      id: "pr2",
      processoId: "p2",
      descricao: "Audiência de instrução",
      tipo: "audiencia" as const,
      dataVencimento: "2024-05-28",
      prioridade: "urgente" as const,
      status: "pendente" as const,
      responsavel: "Dra. Patricia Lima",
      createdAt: "2024-04-05T09:00:00Z",
      updatedAt: "2024-04-05T09:00:00Z",
    },
    {
      id: "pr3",
      processoId: "p3",
      descricao: "Prazo para recurso",
      tipo: "recursal" as const,
      dataVencimento: "2024-04-30",
      prioridade: "urgente" as const,
      status: "pendente" as const,
      responsavel: "Dr. João Paulo Ferreira",
      createdAt: "2024-04-10T10:00:00Z",
      updatedAt: "2024-04-10T10:00:00Z",
    },
  ] as Prazo[],
  tarefas: [
    {
      id: "t1",
      titulo: "Elaborar petição inicial",
      descricao: "Redigir petição inicial do processo de indenização",
      coluna: "concluido" as const,
      prioridade: "alta" as const,
      responsavel: "Dr. João Paulo Ferreira",
      processoId: "p1",
      createdAt: "2024-03-15T10:00:00Z",
      updatedAt: "2024-04-10T10:00:00Z",
    },
    {
      id: "t2",
      titulo: "Preparar documentos para audiência",
      descricao: "Organizar todos os documentos para a audiência de instrução",
      coluna: "em_andamento" as const,
      prioridade: "urgente" as const,
      responsavel: "Dra. Patricia Lima",
      processoId: "p2",
      dataVencimento: "2024-05-27",
      createdAt: "2024-04-05T09:00:00Z",
      updatedAt: "2024-04-14T09:00:00Z",
    },
    {
      id: "t3",
      titulo: "Revisar recurso especial",
      descricao: "Revisar minuta do recurso especial antes de protocolar",
      coluna: "revisao" as const,
      prioridade: "alta" as const,
      responsavel: "Dr. João Paulo Ferreira",
      dataVencimento: "2024-04-28",
      createdAt: "2024-04-10T10:00:00Z",
      updatedAt: "2024-04-14T10:00:00Z",
    },
    {
      id: "t4",
      titulo: "Contatar cliente para atualizações",
      descricao: "Ligar para cliente e informar sobre andamento do processo",
      coluna: "backlog" as const,
      prioridade: "media" as const,
      responsavel: "Dra. Patricia Lima",
      processoId: "p1",
      createdAt: "2024-04-14T10:00:00Z",
      updatedAt: "2024-04-14T10:00:00Z",
    },
    {
      id: "t5",
      titulo: "Calcular honorários de êxito",
      descricao: "Calcular e emitir cobrança de honorários de êxito",
      coluna: "backlog" as const,
      prioridade: "baixa" as const,
      processoId: "p2",
      createdAt: "2024-04-14T10:00:00Z",
      updatedAt: "2024-04-14T10:00:00Z",
    },
  ] as KanbanTarefa[],
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      userProfile: defaultUserProfile,
      updateUserProfile: (p) =>
        set((s) => ({ userProfile: { ...s.userProfile, ...p } })),

      ...sampleData,

      // Processos
      addProcesso: (p) =>
        set((s) => ({
          processos: [
            ...s.processos,
            { ...p, id: uid(), createdAt: now(), updatedAt: now() },
          ],
        })),
      updateProcesso: (id, p) =>
        set((s) => ({
          processos: s.processos.map((x) =>
            x.id === id ? { ...x, ...p, updatedAt: now() } : x
          ),
        })),
      deleteProcesso: (id) =>
        set((s) => ({
          processos: s.processos.filter((x) => x.id !== id),
        })),

      // Movimentações
      addMovimentacao: (m) =>
        set((s) => ({
          movimentacoes: [
            ...s.movimentacoes,
            { ...m, id: uid(), createdAt: now() },
          ],
        })),
      updateMovimentacao: (id, m) =>
        set((s) => ({
          movimentacoes: s.movimentacoes.map((x) =>
            x.id === id ? { ...x, ...m } : x
          ),
        })),
      deleteMovimentacao: (id) =>
        set((s) => ({
          movimentacoes: s.movimentacoes.filter((x) => x.id !== id),
        })),

      // Honorários
      addHonorario: (h) =>
        set((s) => ({
          honorarios: [
            ...s.honorarios,
            { ...h, id: uid(), createdAt: now(), updatedAt: now() },
          ],
        })),
      updateHonorario: (id, h) =>
        set((s) => ({
          honorarios: s.honorarios.map((x) =>
            x.id === id ? { ...x, ...h, updatedAt: now() } : x
          ),
        })),
      deleteHonorario: (id) =>
        set((s) => ({
          honorarios: s.honorarios.filter((x) => x.id !== id),
        })),

      // Procurações
      addProcuracao: (p) =>
        set((s) => ({
          procuracoes: [
            ...s.procuracoes,
            { ...p, id: uid(), createdAt: now() },
          ],
        })),
      updateProcuracao: (id, p) =>
        set((s) => ({
          procuracoes: s.procuracoes.map((x) =>
            x.id === id ? { ...x, ...p } : x
          ),
        })),
      deleteProcuracao: (id) =>
        set((s) => ({
          procuracoes: s.procuracoes.filter((x) => x.id !== id),
        })),

      // Prazos
      addPrazo: (p) =>
        set((s) => ({
          prazos: [
            ...s.prazos,
            { ...p, id: uid(), createdAt: now(), updatedAt: now() },
          ],
        })),
      updatePrazo: (id, p) =>
        set((s) => ({
          prazos: s.prazos.map((x) =>
            x.id === id ? { ...x, ...p, updatedAt: now() } : x
          ),
        })),
      deletePrazo: (id) =>
        set((s) => ({ prazos: s.prazos.filter((x) => x.id !== id) })),

      // Kanban
      addTarefa: (t) =>
        set((s) => ({
          tarefas: [
            ...s.tarefas,
            { ...t, id: uid(), createdAt: now(), updatedAt: now() },
          ],
        })),
      updateTarefa: (id, t) =>
        set((s) => ({
          tarefas: s.tarefas.map((x) =>
            x.id === id ? { ...x, ...t, updatedAt: now() } : x
          ),
        })),
      deleteTarefa: (id) =>
        set((s) => ({ tarefas: s.tarefas.filter((x) => x.id !== id) })),
      moveTarefa: (id, coluna) =>
        set((s) => ({
          tarefas: s.tarefas.map((x) =>
            x.id === id ? { ...x, coluna, updatedAt: now() } : x
          ),
        })),
    }),
    { name: "juridico-office-store" }
  )
);
