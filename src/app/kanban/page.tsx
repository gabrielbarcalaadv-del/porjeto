"use client";
import { useState } from "react";
import { Plus, Kanban as KanbanIcon, Trash2, Calendar, User, Tag, GripVertical } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDate, prioridadeColors } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";
import type { KanbanColuna, Prioridade, KanbanTarefa } from "@/lib/types";

const COLUNAS: { id: KanbanColuna; label: string; color: string; bg: string }[] = [
  { id: "backlog", label: "Backlog", color: "text-gray-600", bg: "bg-gray-100" },
  { id: "em_andamento", label: "Em Andamento", color: "text-blue-700", bg: "bg-blue-100" },
  { id: "revisao", label: "Em Revisão", color: "text-orange-700", bg: "bg-orange-100" },
  { id: "concluido", label: "Concluído", color: "text-green-700", bg: "bg-green-100" },
];

const emptyForm = {
  titulo: "",
  descricao: "",
  coluna: "backlog" as KanbanColuna,
  prioridade: "media" as Prioridade,
  responsavel: "",
  processoId: "",
  dataVencimento: "",
  tags: "",
};

function TarefaCard({
  tarefa,
  processoLabel,
  onDelete,
  onMove,
  onClick,
}: {
  tarefa: KanbanTarefa;
  processoLabel?: string;
  onDelete: () => void;
  onMove: (coluna: KanbanColuna) => void;
  onClick: () => void;
}) {
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-sm font-semibold text-gray-900 flex-1 leading-tight">{tarefa.titulo}</p>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {tarefa.descricao && (
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{tarefa.descricao}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-2">
        <span className={`badge text-xs ${prioridadeColors[tarefa.prioridade]}`}>
          {tarefa.prioridade.charAt(0).toUpperCase() + tarefa.prioridade.slice(1)}
        </span>
        {tarefa.tags?.map((tag) => (
          <span key={tag} className="badge bg-purple-50 text-purple-600 text-xs">{tag}</span>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2 flex-wrap">
          {tarefa.responsavel && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <div className="w-5 h-5 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-xs">
                {tarefa.responsavel.charAt(0).toUpperCase()}
              </div>
              <span className="truncate max-w-[80px]">{tarefa.responsavel}</span>
            </div>
          )}
          {processoLabel && (
            <span className="text-xs text-gray-400 font-mono truncate max-w-[100px]">{processoLabel}</span>
          )}
        </div>
        {tarefa.dataVencimento && (
          <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
            <Calendar size={11} />
            {formatDate(tarefa.dataVencimento)}
          </div>
        )}
      </div>

      {/* Quick move */}
      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
        {COLUNAS.filter((c) => c.id !== tarefa.coluna).map((c) => (
          <button
            key={c.id}
            onClick={() => onMove(c.id)}
            className={`flex-1 text-xs py-1 rounded-lg ${c.bg} ${c.color} font-medium hover:opacity-80 transition-opacity`}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  const { tarefas, processos, addTarefa, deleteTarefa, moveTarefa, updateTarefa } = useStore();
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState<KanbanTarefa | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filterCol, setFilterCol] = useState<KanbanColuna | "todas">("todas");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addTarefa({
      ...form,
      processoId: form.processoId || undefined,
      dataVencimento: form.dataVencimento || undefined,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    });
    setModalOpen(false);
    setForm(emptyForm);
  }

  const counts = COLUNAS.reduce<Record<string, number>>((acc, c) => {
    acc[c.id] = tarefas.filter((t) => t.coluna === c.id).length;
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Kanban de Tarefas"
        subtitle={`${tarefas.length} tarefa(s) no total`}
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Nova Tarefa
          </button>
        }
      />

      {/* Column summary */}
      <div className="flex gap-3 mb-5 overflow-x-auto pb-2">
        {COLUNAS.map((col) => (
          <button
            key={col.id}
            onClick={() => setFilterCol(filterCol === col.id ? "todas" : col.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0 ${
              filterCol === col.id
                ? `${col.bg} ${col.color} ring-2 ring-offset-1 ring-current`
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span>{col.label}</span>
            <span className={`badge ${col.bg} ${col.color}`}>{counts[col.id]}</span>
          </button>
        ))}
      </div>

      {/* Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {COLUNAS.map((col) => {
          const colTarefas = tarefas
            .filter((t) => t.coluna === col.id && (filterCol === "todas" || filterCol === col.id))
            .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

          if (filterCol !== "todas" && filterCol !== col.id) return null;

          return (
            <div key={col.id} className="flex flex-col gap-3 min-h-[200px]">
              {/* Column header */}
              <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${col.bg}`}>
                <h3 className={`text-sm font-bold ${col.color}`}>{col.label}</h3>
                <span className={`badge ${col.bg} ${col.color} font-bold`}>{colTarefas.length}</span>
              </div>

              {/* Cards */}
              <div className="space-y-3 flex-1">
                {colTarefas.length === 0 && (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center">
                    <p className="text-gray-400 text-xs">Nenhuma tarefa</p>
                  </div>
                )}
                {colTarefas.map((tarefa) => {
                  const processo = processos.find((p) => p.id === tarefa.processoId);
                  return (
                    <TarefaCard
                      key={tarefa.id}
                      tarefa={tarefa}
                      processoLabel={processo ? processo.numero : undefined}
                      onDelete={() => {
                        if (confirm("Excluir esta tarefa?")) deleteTarefa(tarefa.id);
                      }}
                      onMove={(coluna) => moveTarefa(tarefa.id, coluna)}
                      onClick={() => setDetailModal(tarefa)}
                    />
                  );
                })}
              </div>

              {/* Add quick */}
              <button
                onClick={() => { setForm({ ...emptyForm, coluna: col.id }); setModalOpen(true); }}
                className="text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-100 py-2 px-3 rounded-lg transition-colors text-left flex items-center gap-1.5"
              >
                <Plus size={13} /> Adicionar tarefa
              </button>
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {detailModal && (
        <Modal open={!!detailModal} onClose={() => setDetailModal(null)} title="Detalhes da Tarefa" size="md">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Título</p>
              <p className="font-semibold text-gray-900">{detailModal.titulo}</p>
            </div>
            {detailModal.descricao && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Descrição</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{detailModal.descricao}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">Status / Coluna</p>
                <select
                  className="select text-xs py-1.5"
                  value={detailModal.coluna}
                  onChange={(e) => {
                    moveTarefa(detailModal.id, e.target.value as KanbanColuna);
                    setDetailModal({ ...detailModal, coluna: e.target.value as KanbanColuna });
                  }}
                >
                  {COLUNAS.map((c) => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Prioridade</p>
                <span className={`badge ${prioridadeColors[detailModal.prioridade]}`}>
                  {detailModal.prioridade.charAt(0).toUpperCase() + detailModal.prioridade.slice(1)}
                </span>
              </div>
              {detailModal.responsavel && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Responsável</p>
                  <p className="text-sm font-medium text-gray-900">{detailModal.responsavel}</p>
                </div>
              )}
              {detailModal.dataVencimento && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Vencimento</p>
                  <p className="text-sm font-medium text-gray-900">{formatDate(detailModal.dataVencimento)}</p>
                </div>
              )}
            </div>
            {detailModal.tags && detailModal.tags.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {detailModal.tags.map((tag) => (
                    <span key={tag} className="badge bg-purple-50 text-purple-700">{tag}</span>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2 border-t">
              <button
                className="btn-danger py-1.5 px-3 text-xs"
                onClick={() => {
                  if (confirm("Excluir esta tarefa?")) {
                    deleteTarefa(detailModal.id);
                    setDetailModal(null);
                  }
                }}
              >
                <Trash2 size={13} /> Excluir
              </button>
              <button className="btn-secondary py-1.5 px-3 text-xs" onClick={() => setDetailModal(null)}>
                Fechar
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Tarefa" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Título *</label>
            <input
              className="input"
              placeholder="Título da tarefa"
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="label">Descrição</label>
            <textarea
              className="textarea"
              rows={2}
              placeholder="Descreva a tarefa..."
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Coluna</label>
              <select
                className="select"
                value={form.coluna}
                onChange={(e) => setForm({ ...form, coluna: e.target.value as KanbanColuna })}
              >
                {COLUNAS.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
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
                placeholder="Nome do responsável"
                value={form.responsavel}
                onChange={(e) => setForm({ ...form, responsavel: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Data de Vencimento</label>
              <input
                className="input"
                type="date"
                value={form.dataVencimento}
                onChange={(e) => setForm({ ...form, dataVencimento: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Processo (opcional)</label>
              <select
                className="select"
                value={form.processoId}
                onChange={(e) => setForm({ ...form, processoId: e.target.value })}
              >
                <option value="">Nenhum</option>
                {processos.map((p) => (
                  <option key={p.id} value={p.id}>{p.numero}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Tags (separadas por vírgula)</label>
              <input
                className="input"
                placeholder="urgente, revisão, cliente"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Criar Tarefa
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
