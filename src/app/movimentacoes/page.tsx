"use client";
import { useState } from "react";
import { Plus, Search, FileText, Filter, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  formatDate,
  tipoMovimentacaoLabels,
} from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import type { MovimentacaoTipo } from "@/lib/types";

const emptyForm = {
  processoId: "",
  data: new Date().toISOString().slice(0, 10),
  tipo: "peticao" as MovimentacaoTipo,
  descricao: "",
  responsavel: "",
  documento: "",
};

const tipoColors: Record<string, string> = {
  peticao: "bg-blue-100 text-blue-700",
  audiencia: "bg-purple-100 text-purple-700",
  despacho: "bg-gray-100 text-gray-700",
  sentenca: "bg-red-100 text-red-700",
  recurso: "bg-orange-100 text-orange-700",
  citacao: "bg-yellow-100 text-yellow-700",
  intimacao: "bg-cyan-100 text-cyan-700",
  acordo: "bg-green-100 text-green-700",
  outro: "bg-gray-100 text-gray-600",
};

export default function MovimentacoesPage() {
  const { movimentacoes, processos, addMovimentacao, deleteMovimentacao } = useStore();
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("todos");
  const [filterProcesso, setFilterProcesso] = useState("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const sorted = [...movimentacoes].sort(
    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
  );

  const filtered = sorted.filter((m) => {
    const q = search.toLowerCase();
    const processo = processos.find((p) => p.id === m.processoId);
    const matchSearch =
      !q ||
      m.descricao.toLowerCase().includes(q) ||
      processo?.numero.toLowerCase().includes(q) ||
      processo?.cliente.toLowerCase().includes(q);
    const matchTipo = filterTipo === "todos" || m.tipo === filterTipo;
    const matchProc = filterProcesso === "todos" || m.processoId === filterProcesso;
    return matchSearch && matchTipo && matchProc;
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addMovimentacao(form);
    setModalOpen(false);
    setForm(emptyForm);
  }

  return (
    <div>
      <PageHeader
        title="Movimentações Processuais"
        subtitle={`${movimentacoes.length} movimentação(ões) registrada(s)`}
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Nova Movimentação
          </button>
        }
      />

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por descrição, processo ou cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-gray-400" />
          <select
            className="select w-auto"
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="todos">Todos os Tipos</option>
            {Object.entries(tipoMovimentacaoLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            className="select w-auto"
            value={filterProcesso}
            onChange={(e) => setFilterProcesso(e.target.value)}
          >
            <option value="todos">Todos os Processos</option>
            {processos.map((p) => (
              <option key={p.id} value={p.id}>
                {p.numero} - {p.cliente}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-3">
        {filtered.length === 0 && (
          <div className="card p-10 text-center text-gray-400">
            <FileText size={32} className="mx-auto mb-2 opacity-30" />
            <p>Nenhuma movimentação encontrada</p>
          </div>
        )}
        {filtered.map((mov) => {
          const processo = processos.find((p) => p.id === mov.processoId);
          return (
            <div key={mov.id} className="card p-4 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{mov.descricao}</p>
                    {processo && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Processo: <span className="font-mono">{processo.numero}</span> — {processo.cliente}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`badge ${tipoColors[mov.tipo] ?? "bg-gray-100 text-gray-600"}`}>
                        {tipoMovimentacaoLabels[mov.tipo]}
                      </span>
                      {mov.responsavel && (
                        <span className="text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full border">
                          {mov.responsavel}
                        </span>
                      )}
                      {mov.documento && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {mov.documento}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(mov.data)}</p>
                    <button
                      onClick={() => {
                        if (confirm("Excluir esta movimentação?")) deleteMovimentacao(mov.id);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Movimentação" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Processo *</label>
            <select
              className="select"
              value={form.processoId}
              onChange={(e) => setForm({ ...form, processoId: e.target.value })}
              required
            >
              <option value="">Selecione um processo...</option>
              {processos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.numero} — {p.cliente}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data *</label>
              <input
                className="input"
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select
                className="select"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as MovimentacaoTipo })}
              >
                {Object.entries(tipoMovimentacaoLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Descrição *</label>
            <textarea
              className="textarea"
              rows={3}
              placeholder="Descreva a movimentação processual..."
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Responsável</label>
              <input
                className="input"
                placeholder="Nome do advogado"
                value={form.responsavel}
                onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Documento / Referência</label>
              <input
                className="input"
                placeholder="Número ou referência do documento"
                value={form.documento}
                onChange={(e) => setForm({ ...form, documento: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Registrar Movimentação
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
