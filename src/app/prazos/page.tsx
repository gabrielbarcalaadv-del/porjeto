"use client";
import { useState } from "react";
import { Plus, Search, Clock, Filter, Trash2, CheckCircle, AlertTriangle, Bell } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  formatDate,
  daysUntil,
  prioridadeColors,
  prazoStatusColors,
  prazoTipoLabels,
} from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import type { PrazoTipo, PrazoStatus, Prioridade } from "@/lib/types";

const emptyForm = {
  processoId: "",
  descricao: "",
  tipo: "outro" as PrazoTipo,
  dataVencimento: new Date().toISOString().slice(0, 10),
  prioridade: "media" as Prioridade,
  status: "pendente" as PrazoStatus,
  responsavel: "",
  observacoes: "",
};

function urgencyLevel(dataVencimento: string, status: string) {
  if (status !== "pendente") return 0;
  const days = daysUntil(dataVencimento);
  if (days < 0) return 4; // vencido
  if (days <= 3) return 3;
  if (days <= 7) return 2;
  if (days <= 15) return 1;
  return 0;
}

export default function PrazosPage() {
  const { prazos, processos, addPrazo, updatePrazo, deletePrazo } = useStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterPrioridade, setFilterPrioridade] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [view, setView] = useState<"list" | "board">("list");

  const filtered = prazos
    .filter((p) => {
      const q = search.toLowerCase();
      const processo = processos.find((pr) => pr.id === p.processoId);
      const matchSearch =
        !q ||
        p.descricao.toLowerCase().includes(q) ||
        p.responsavel.toLowerCase().includes(q) ||
        processo?.cliente.toLowerCase().includes(q);
      const matchStatus = filterStatus === "todos" || p.status === filterStatus;
      const matchTipo = filterTipo === "todos" || p.tipo === filterTipo;
      const matchPrioridade = filterPrioridade === "todos" || p.prioridade === filterPrioridade;
      return matchSearch && matchStatus && matchTipo && matchPrioridade;
    })
    .sort((a, b) => {
      const ua = urgencyLevel(a.dataVencimento, a.status);
      const ub = urgencyLevel(b.dataVencimento, b.status);
      if (ub !== ua) return ub - ua;
      return new Date(a.dataVencimento).getTime() - new Date(b.dataVencimento).getTime();
    });

  const pendentes = prazos.filter((p) => p.status === "pendente");
  const vencidos = pendentes.filter((p) => daysUntil(p.dataVencimento) < 0);
  const proximos7 = pendentes.filter((p) => {
    const d = daysUntil(p.dataVencimento);
    return d >= 0 && d <= 7;
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addPrazo({ ...form, processoId: form.processoId || undefined });
    setModalOpen(false);
    setForm(emptyForm);
  }

  function getDaysLabel(dataVencimento: string, status: string) {
    if (status === "concluido") return { label: "Concluído", cls: "text-green-600" };
    if (status === "vencido") return { label: "Vencido", cls: "text-gray-500" };
    if (status === "prorrogado") return { label: "Prorrogado", cls: "text-blue-600" };
    const d = daysUntil(dataVencimento);
    if (d < 0) return { label: `${Math.abs(d)}d atrasado`, cls: "text-red-600 font-bold" };
    if (d === 0) return { label: "Vence hoje!", cls: "text-red-600 font-bold" };
    if (d <= 3) return { label: `${d}d restantes`, cls: "text-red-500 font-semibold" };
    if (d <= 7) return { label: `${d}d restantes`, cls: "text-orange-500 font-semibold" };
    if (d <= 15) return { label: `${d}d restantes`, cls: "text-yellow-600" };
    return { label: `${d}d restantes`, cls: "text-green-600" };
  }

  return (
    <div>
      <PageHeader
        title="Controle de Prazos"
        subtitle={`${prazos.length} prazo(s) cadastrado(s)`}
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Novo Prazo
          </button>
        }
      />

      {/* Alert summary */}
      {(vencidos.length > 0 || proximos7.length > 0) && (
        <div className="grid grid-cols-2 gap-4 mb-5">
          {vencidos.length > 0 && (
            <div className="card p-4 border-l-4 border-red-500 flex items-center gap-3">
              <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-700">{vencidos.length} prazo(s) vencido(s)</p>
                <p className="text-xs text-red-500">Requer atenção imediata</p>
              </div>
            </div>
          )}
          {proximos7.length > 0 && (
            <div className="card p-4 border-l-4 border-orange-500 flex items-center gap-3">
              <Bell size={20} className="text-orange-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-orange-700">{proximos7.length} prazo(s) nos próximos 7 dias</p>
                <p className="text-xs text-orange-500">Verifique sua agenda</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por descrição ou responsável..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-gray-400" />
          <select className="select w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="concluido">Concluído</option>
            <option value="vencido">Vencido</option>
            <option value="prorrogado">Prorrogado</option>
          </select>
          <select className="select w-auto" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
            <option value="todos">Todos os Tipos</option>
            {Object.entries(prazoTipoLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select className="select w-auto" value={filterPrioridade} onChange={(e) => setFilterPrioridade(e.target.value)}>
            <option value="todos">Todas as Prioridades</option>
            <option value="urgente">Urgente</option>
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card p-10 text-center text-gray-400">
            <Clock size={32} className="mx-auto mb-2 opacity-30" />
            <p>Nenhum prazo encontrado</p>
          </div>
        )}
        {filtered.map((prazo) => {
          const processo = processos.find((p) => p.id === prazo.processoId);
          const { label: daysLabel, cls: daysCls } = getDaysLabel(prazo.dataVencimento, prazo.status);
          const ul = urgencyLevel(prazo.dataVencimento, prazo.status);
          const leftBorder =
            ul === 4 || ul === 3 ? "border-l-4 border-red-500"
            : ul === 2 ? "border-l-4 border-orange-500"
            : ul === 1 ? "border-l-4 border-yellow-400"
            : prazo.status === "concluido" ? "border-l-4 border-green-500"
            : "";

          return (
            <div key={prazo.id} className={`card p-4 flex items-start gap-4 hover:shadow-md transition-shadow ${leftBorder}`}>
              <div className="flex-shrink-0 w-11 h-11 bg-orange-50 rounded-xl flex items-center justify-center">
                <Clock size={20} className="text-orange-500" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gray-900">{prazo.descricao}</p>
                      <span className={`badge ${prioridadeColors[prazo.prioridade]}`}>
                        {prazo.prioridade.charAt(0).toUpperCase() + prazo.prioridade.slice(1)}
                      </span>
                      <span className={`badge ${prazoStatusColors[prazo.status]}`}>
                        {prazo.status.charAt(0).toUpperCase() + prazo.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5">
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {prazoTipoLabels[prazo.tipo]}
                      </span>
                      {prazo.responsavel && (
                        <span className="text-xs text-gray-500">{prazo.responsavel}</span>
                      )}
                      {processo && (
                        <span className="text-xs text-gray-400 font-mono">{processo.numero}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-sm ${daysCls}`}>{daysLabel}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{formatDate(prazo.dataVencimento)}</p>
                  </div>
                </div>
                {prazo.observacoes && (
                  <p className="text-xs text-gray-500 mt-2 bg-gray-50 rounded-lg px-3 py-1.5">
                    {prazo.observacoes}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1 flex-shrink-0">
                {prazo.status === "pendente" && (
                  <button
                    onClick={() => updatePrazo(prazo.id, { status: "concluido" })}
                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Marcar como concluído"
                  >
                    <CheckCircle size={16} />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (confirm("Excluir este prazo?")) deletePrazo(prazo.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Prazo" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Processo (opcional)</label>
            <select
              className="select"
              value={form.processoId}
              onChange={(e) => setForm({ ...form, processoId: e.target.value })}
            >
              <option value="">Selecione um processo...</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>{p.numero} — {p.cliente}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Descrição do Prazo *</label>
            <input
              className="input"
              placeholder="Ex: Prazo para contestação"
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Tipo *</label>
              <select
                className="select"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as PrazoTipo })}
              >
                {Object.entries(prazoTipoLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Data de Vencimento *</label>
              <input
                className="input"
                type="date"
                value={form.dataVencimento}
                onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Prioridade</label>
              <select
                className="select"
                value={form.prioridade}
                onChange={(e) => setForm({ ...form, prioridade: e.target.value as Prioridade })}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <div>
              <label className="label">Responsável</label>
              <input
                className="input"
                placeholder="Nome do advogado"
                value={form.responsavel}
                onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="label">Observações</label>
              <textarea
                className="textarea"
                rows={2}
                placeholder="Observações sobre o prazo..."
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Adicionar Prazo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
