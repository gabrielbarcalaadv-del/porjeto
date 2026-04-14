"use client";
import { useState } from "react";
import Link from "next/link";
import { Plus, Search, FolderOpen, ChevronRight, Filter, Eye, Trash2, Edit } from "lucide-react";
import { useStore } from "@/lib/store";
import {
  formatDate,
  formatCurrency,
  statusProcessoColors,
  tipoProcessoLabels,
} from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import type { Processo, ProcessoStatus, ProcessoTipo } from "@/lib/types";

const emptyForm = {
  numero: "",
  cliente: "",
  parteContraria: "",
  tribunal: "",
  vara: "",
  juiz: "",
  tipo: "civel" as ProcessoTipo,
  status: "ativo" as ProcessoStatus,
  dataAbertura: new Date().toISOString().slice(0, 10),
  descricao: "",
  advogadoResponsavel: "",
  valor: "",
};

export default function ProcessosPage() {
  const { processos, addProcesso, deleteProcesso } = useStore();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("todos");
  const [filterTipo, setFilterTipo] = useState<string>("todos");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const filtered = processos.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      p.numero.toLowerCase().includes(q) ||
      p.cliente.toLowerCase().includes(q) ||
      p.parteContraria.toLowerCase().includes(q);
    const matchStatus = filterStatus === "todos" || p.status === filterStatus;
    const matchTipo = filterTipo === "todos" || p.tipo === filterTipo;
    return matchSearch && matchStatus && matchTipo;
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addProcesso({
      ...form,
      valor: form.valor ? parseFloat(form.valor) : undefined,
    });
    setModalOpen(false);
    setForm(emptyForm);
  }

  function handleDelete(id: string) {
    if (confirm("Deseja excluir este processo?")) deleteProcesso(id);
  }

  return (
    <div>
      <PageHeader
        title="Processos"
        subtitle={`${processos.length} processo(s) cadastrado(s)`}
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Novo Processo
          </button>
        }
      />

      {/* Filters */}
      <div className="card p-4 mb-5 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por número, cliente ou parte contrária..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            className="select w-auto"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="todos">Todos os Status</option>
            <option value="ativo">Ativo</option>
            <option value="suspenso">Suspenso</option>
            <option value="arquivado">Arquivado</option>
            <option value="encerrado">Encerrado</option>
          </select>
          <select
            className="select w-auto"
            value={filterTipo}
            onChange={(e) => setFilterTipo(e.target.value)}
          >
            <option value="todos">Todos os Tipos</option>
            {Object.entries(tipoProcessoLabels).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Número</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Parte Contrária</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Abertura</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-gray-400">
                    <FolderOpen size={32} className="mx-auto mb-2 opacity-30" />
                    <p>Nenhum processo encontrado</p>
                  </td>
                </tr>
              )}
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link
                      href={`/processos/${p.id}`}
                      className="font-mono text-xs text-primary-700 hover:underline"
                    >
                      {p.numero}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">{p.cliente}</td>
                  <td className="px-4 py-3 text-gray-600">{p.parteContraria}</td>
                  <td className="px-4 py-3">
                    <span className="badge bg-blue-100 text-blue-700">
                      {tipoProcessoLabels[p.tipo]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusProcessoColors[p.status]}`}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {p.valor ? formatCurrency(p.valor) : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(p.dataAbertura)}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/processos/${p.id}`}
                        className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Visualizar"
                      >
                        <Eye size={15} />
                      </Link>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo Processo" size="xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Número do Processo *</label>
              <input
                className="input font-mono"
                placeholder="0000000-00.0000.0.00.0000"
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                required
              />
            </div>
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
              <label className="label">Parte Contrária</label>
              <input
                className="input"
                placeholder="Nome da parte contrária"
                value={form.parteContraria}
                onChange={(e) => setForm({ ...form, parteContraria: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Tribunal *</label>
              <input
                className="input"
                placeholder="Ex: TJSP, TRT15, STJ..."
                value={form.tribunal}
                onChange={(e) => setForm({ ...form, tribunal: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Vara</label>
              <input
                className="input"
                placeholder="Ex: 3ª Vara Cível"
                value={form.vara}
                onChange={(e) => setForm({ ...form, vara: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Juiz(a)</label>
              <input
                className="input"
                placeholder="Nome do juiz"
                value={form.juiz}
                onChange={(e) => setForm({ ...form, juiz: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Advogado Responsável *</label>
              <input
                className="input"
                placeholder="Nome do advogado"
                value={form.advogadoResponsavel}
                onChange={(e) => setForm({ ...form, advogadoResponsavel: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Tipo de Ação *</label>
              <select
                className="select"
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value as ProcessoTipo })}
              >
                {Object.entries(tipoProcessoLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="select"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as ProcessoStatus })}
              >
                <option value="ativo">Ativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="arquivado">Arquivado</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>
            <div>
              <label className="label">Data de Abertura *</label>
              <input
                className="input"
                type="date"
                value={form.dataAbertura}
                onChange={(e) => setForm({ ...form, dataAbertura: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Valor da Causa (R$)</label>
              <input
                className="input"
                type="number"
                placeholder="0,00"
                value={form.valor}
                onChange={(e) => setForm({ ...form, valor: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="label">Descrição</label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Descreva o objeto da ação..."
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} />
              Cadastrar Processo
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
