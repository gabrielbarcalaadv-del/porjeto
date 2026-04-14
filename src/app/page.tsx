"use client";
import Link from "next/link";
import {
  FolderOpen,
  Clock,
  Receipt,
  FileText,
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Calendar,
  Stamp,
  Kanban,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  formatDate,
  formatCurrency,
  daysUntil,
  prioridadeColors,
  statusProcessoColors,
  tipoProcessoLabels,
  prazoStatusColors,
} from "@/lib/utils";

export default function Dashboard() {
  const { processos, prazos, honorarios, movimentacoes, tarefas } = useStore();

  const processosAtivos = processos.filter((p) => p.status === "ativo");
  const prazosUrgentes = prazos
    .filter((p) => p.status === "pendente")
    .sort((a, b) => new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime())
    .slice(0, 5);
  const honorariosPendentes = honorarios.filter((h) => h.status === "pendente");
  const totalPendente = honorariosPendentes.reduce((s, h) => s + h.valor, 0);
  const tarefasEmAndamento = tarefas.filter((t) => t.coluna === "em_andamento");
  const movRecentes = [...movimentacoes]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
    .slice(0, 5);

  const stats = [
    {
      label: "Processos Ativos",
      value: processosAtivos.length,
      icon: FolderOpen,
      color: "bg-blue-500",
      href: "/processos",
    },
    {
      label: "Prazos Pendentes",
      value: prazos.filter((p) => p.status === "pendente").length,
      icon: Clock,
      color: "bg-orange-500",
      href: "/prazos",
    },
    {
      label: "Honorários a Receber",
      value: formatCurrency(totalPendente),
      icon: Receipt,
      color: "bg-green-500",
      href: "/honorarios",
    },
    {
      label: "Tarefas em Andamento",
      value: tarefasEmAndamento.length,
      icon: Kanban,
      color: "bg-purple-500",
      href: "/kanban",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Visão geral do escritório
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="card p-5 flex items-center gap-4 hover:shadow-md transition-shadow group"
          >
            <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon size={22} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </div>
            <ChevronRight size={16} className="ml-auto text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Próximos Prazos */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <Clock size={18} className="text-orange-500" />
              Próximos Prazos
            </h2>
            <Link href="/prazos" className="text-primary-700 text-xs font-medium hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {prazosUrgentes.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Nenhum prazo pendente</p>
            )}
            {prazosUrgentes.map((prazo) => {
              const days = daysUntil(prazo.dataVencimento);
              const isOverdue = days < 0;
              const processo = processos.find((p) => p.id === prazo.processoId);
              return (
                <div
                  key={prazo.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                >
                  <div
                    className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                      isOverdue
                        ? "bg-red-500"
                        : days <= 3
                        ? "bg-red-400"
                        : days <= 7
                        ? "bg-orange-400"
                        : "bg-yellow-400"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{prazo.descricao}</p>
                    {processo && (
                      <p className="text-xs text-gray-500 truncate">{processo.cliente}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-xs font-semibold ${isOverdue ? "text-red-600" : days <= 7 ? "text-orange-600" : "text-gray-600"}`}>
                      {isOverdue ? `${Math.abs(days)}d atrás` : days === 0 ? "Hoje" : `${days}d`}
                    </p>
                    <p className="text-xs text-gray-400">{formatDate(prazo.dataVencimento)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Movimentações Recentes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" />
              Movimentações Recentes
            </h2>
            <Link href="/movimentacoes" className="text-primary-700 text-xs font-medium hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="space-y-3">
            {movRecentes.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Nenhuma movimentação</p>
            )}
            {movRecentes.map((mov) => {
              const processo = processos.find((p) => p.id === mov.processoId);
              return (
                <div
                  key={mov.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText size={14} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{mov.descricao}</p>
                    {processo && (
                      <p className="text-xs text-gray-500 truncate">
                        {processo.numero} - {processo.cliente}
                      </p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(mov.data)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processos Recentes */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <FolderOpen size={18} className="text-blue-600" />
              Processos Ativos
            </h2>
            <Link href="/processos" className="text-primary-700 text-xs font-medium hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-3">
            {processosAtivos.slice(0, 4).map((p) => (
              <Link
                key={p.id}
                href={`/processos/${p.id}`}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 group"
              >
                <div className="w-9 h-9 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FolderOpen size={16} className="text-primary-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.cliente}</p>
                  <p className="text-xs text-gray-500 truncate">{p.numero}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className={`badge ${statusProcessoColors[p.status]}`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{tipoProcessoLabels[p.tipo]}</p>
                </div>
              </Link>
            ))}
            {processosAtivos.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-4">Nenhum processo ativo</p>
            )}
          </div>
        </div>

        {/* Alertas */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h2 className="text-base font-semibold text-gray-900">Alertas & Avisos</h2>
          </div>
          <div className="space-y-3">
            {prazos.filter(p => p.status === "pendente" && daysUntil(p.dataVencimento) <= 7).map(prazo => (
              <div key={prazo.id} className="flex gap-3 p-3 bg-red-50 border border-red-100 rounded-lg">
                <AlertTriangle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-red-800 truncate">{prazo.descricao}</p>
                  <p className="text-xs text-red-600">
                    Vence em {daysUntil(prazo.dataVencimento) <= 0 ? "HOJE" : `${daysUntil(prazo.dataVencimento)} dia(s)`} - {formatDate(prazo.dataVencimento)}
                  </p>
                </div>
              </div>
            ))}
            {honorarios.filter(h => h.status === "vencido").map(h => (
              <div key={h.id} className="flex gap-3 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                <Receipt size={16} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-orange-800 truncate">
                    Honorário vencido - {h.cliente}
                  </p>
                  <p className="text-xs text-orange-600">{formatCurrency(h.valor)} - {formatDate(h.vencimento)}</p>
                </div>
              </div>
            ))}
            {prazos.filter(p => p.status === "pendente" && daysUntil(p.dataVencimento) <= 7).length === 0 &&
             honorarios.filter(h => h.status === "vencido").length === 0 && (
              <div className="flex gap-3 p-3 bg-green-50 border border-green-100 rounded-lg">
                <TrendingUp size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">Nenhum alerta urgente. Tudo em dia!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
