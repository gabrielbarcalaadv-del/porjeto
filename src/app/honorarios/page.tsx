"use client";
import { useState } from "react";
import { Plus, Search, Receipt, Filter, Trash2, Edit, CheckCircle, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  formatDate,
  formatCurrency,
  honorarioStatusColors,
  honorarioTipoLabels,
  prioridadeColors,
} from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import type { HonorarioTipo, HonorarioStatus } from "@/lib/types";

const emptyForm = {
  processoId: "",
  cliente: "",
  tipo: "fixo" as HonorarioTipo,
  valor: "",
  percentual: "",
  vencimento: new Date().toISOString().slice(0, 10),
  status: "pendente" as HonorarioStatus,
  descricao: "",
  contrato: "",
};

export default function HonorariosPage() {
  const { honorarios, processos, addHonorario, updateHonorario, deleteHonorario } = useStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = honorarios.filter((h) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q || h.cliente.toLowerCase().includes(q) || h.descricao.toLowerCase().includes(q);
    const matchStatus = filterStatus === "todos" || h.status === filterStatus;
    const matchTipo = filterTipo === "todos" || h.tipo === filterTipo;
    return matchSearch && matchStatus && matchTipo;
  });

  const totalPendente = honorarios.filter(h => h.status === "pendente").reduce((s, h) => s + h.valor, 0);
  const totalPago = honorarios.filter(h => h.status === "pago").reduce((s, h) => s + h.valor, 0);
  const totalVencido = honorarios.filter(h => h.status === "vencido").reduce((s, h) => s + h.valor, 0);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addHonorario({
      ...form,
      valor: parseFloat(form.valor),
      percentual: form.percentual ? parseFloat(form.percentual) : undefined,
      processoId: form.processoId || undefined,
    });
    setModalOpen(false);
    setForm(emptyForm);
  }

  function handleStatusChange(id: string, status: HonorarioStatus) {
    updateHonorario(id, { status });
  }

  return (
    <div>
      <PageHeader
        title="Contratos de Honorários"
        subtitle={`${honorarios.length} contrato(s) registrado(s)`}
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Novo Contrato
          </button>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <Receipt size={18} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">A Receber</p>
            <p className="text-lg font-bold text-yellow-700">{formatCurrency(totalPendente)}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle size={18} className="text-green-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Recebido</p>
            <p className="text-lg font-bold text-green-700">{formatCurrency(totalPago)}</p>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <TrendingUp size={18} className="text-red-600" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Vencido</p>
            <p className="text-lg font-bold text-red-700">{formatCurrency(totalVencido)}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por cliente ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select className="select w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="todos">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="pago">Pago</option>
            <option value="vencido">Vencido</option>
            <option value="cancelado">Cancelado</option>
          </select>
          <select className="select w-auto" value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
            <option value="todos">Todos os Tipos</option>
            {Object.entries(honorarioTipoLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-3 card p-10 text-center text-gray-400">
            <Receipt size={32} className="mx-auto mb-2 opacity-30" />
            <p>Nenhum honorário encontrado</p>
          </div>
        )}
        {filtered.map((h) => {
          const processo = processos.find((p) => p.id === h.processoId);
          return (
            <div key={h.id} className="card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{h.cliente}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{h.descricao}</p>
                </div>
                <span className={`badge ml-2 flex-shrink-0 ${honorarioStatusColors[h.status]}`}>
                  {h.status.charAt(0).toUpperCase() + h.status.slice(1)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(h.valor)}</p>
                  {h.percentual && (
                    <p className="text-xs text-gray-500">{h.percentual}% sobre condenação</p>
                  )}
                </div>
                <span className="badge bg-indigo-100 text-indigo-700">
                  {honorarioTipoLabels[h.tipo]}
                </span>
              </div>

              {processo && (
                <div className="text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
                  <span className="font-mono">{processo.numero}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Vencimento: <span className="font-medium text-gray-700">{formatDate(h.vencimento)}</span>
                </p>
                <div className="flex gap-1">
                  {h.status === "pendente" && (
                    <button
                      onClick={() => handleStatusChange(h.id, "pago")}
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Marcar como pago"
                    >
                      <CheckCircle size={15} />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Excluir este honorário?")) deleteHonorario(h.id);
                    }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Contrato de Honorários" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Processo (opcional)</label>
            <select
              className="select"
              value={form.processoId}
              onChange={(e) => {
                const proc = processos.find(p => p.id === e.target.value);
                setForm({ ...form, processoId: e.target.value, cliente: proc?.cliente ?? form.cliente });
              }}
            >
              <option value="">Selecione um processo...</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>{p.numero} — {p.cliente}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Cliente *</label>
              <input
                className="input"
                placeholder="Nome do cliente"
                value={form.cliente}
                onChange={(e) => setForm({ ...form, cliente: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Tipo de Honorário *</label>
              <select
                className="select"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as HonorarioTipo })}
              >
                {Object.entries(honorarioTipoLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Valor (R$) *</label>
              <input
                className="input"
                type="number"
                placeholder="0,00"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
                required
              />
            </div>
            {form.tipo === "exito" && (
              <div>
                <label className="label">Percentual (%)</label>
                <input
                  className="input"
                  type="number"
                  placeholder="20"
                  value={form.percentual}
                  onChange={(e) => setForm({ ...form, percentual: e.target.value })}
                />
              </div>
            )}
            <div>
              <label className="label">Vencimento *</label>
              <input
                className="input"
                type="date"
                value={form.vencimento}
                onChange={(e) => setForm({ ...form, vencimento: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as HonorarioStatus })}
              >
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
                <option value="vencido">Vencido</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Descrição</label>
              <textarea
                className="textarea"
                rows={2}
                placeholder="Descreva o contrato de honorários..."
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="label">Número do Contrato</label>
              <input
                className="input"
                placeholder="Ex: CONTR-2024-001"
                value={form.contrato}
                onChange={(e) => setForm({ ...form, contrato: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Salvar Contrato
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
