"use client";
import { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FolderOpen,
  FileText,
  Plus,
  Clock,
  Edit,
  Trash2,
  ChevronRight,
  User,
  Building,
  Gavel,
  Calendar,
  BadgeDollarSign,
} from "lucide-react";
import { useStore } from "@/lib/store";
import {
  formatDate,
  formatCurrency,
  statusProcessoColors,
  tipoProcessoLabels,
  tipoMovimentacaoLabels,
  prioridadeColors,
  prazoStatusColors,
} from "@/lib/utils";
import Modal from "@/components/Modal";
import type { Processo, MovimentacaoTipo, ProcessoStatus, ProcessoTipo } from "@/lib/types";

export default function ProcessoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    processos,
    movimentacoes,
    prazos,
    honorarios,
    addMovimentacao,
    updateProcesso,
    deleteProcesso,
  } = useStore();

  const processo = processos.find((p) => p.id === id);
  const procMovs = movimentacoes
    .filter((m) => m.processoId === id)
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  const procPrazos = prazos.filter((p) => p.processoId === id);
  const procHonorarios = honorarios.filter((h) => h.processoId === id);

  const [movModalOpen, setMovModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [movForm, setMovForm] = useState({
    data: new Date().toISOString().slice(0, 10),
    tipo: "peticao" as MovimentacaoTipo,
    descricao: "",
    responsavel: "",
    documento: "",
  });
  const [editForm, setEditForm] = useState<Partial<Processo>>({});

  if (!processo) {
    return (
      <div className="text-center py-20">
        <FolderOpen size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500">Processo não encontrado.</p>
        <Link href="/processos" className="btn-primary mt-4 inline-flex">
          <ArrowLeft size={16} /> Voltar
        </Link>
      </div>
    );
  }

  function handleAddMovimentacao(e: React.FormEvent) {
    e.preventDefault();
    addMovimentacao({ ...movForm, processoId: id });
    setMovModalOpen(false);
    setMovForm({
      data: new Date().toISOString().slice(0, 10),
      tipo: "peticao",
      descricao: "",
      responsavel: "",
      documento: "",
    });
  }

  function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    updateProcesso(id, editForm);
    setEditModalOpen(false);
  }

  function openEdit() {
    setEditForm({ ...processo });
    setEditModalOpen(true);
  }

  function handleDelete() {
    if (confirm("Deseja excluir este processo e todos os seus dados?")) {
      deleteProcesso(id);
      router.push("/processos");
    }
  }

  return (
    <div className="space-y-6">
      {/* Back nav */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/processos" className="hover:text-gray-700">Processos</Link>
        <ChevronRight size={14} />
        <span className="text-gray-900 font-medium truncate">{processo.numero}</span>
      </div>

      {/* Header card */}
      <div className="card p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <FolderOpen size={24} className="text-primary-700" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge ${statusProcessoColors[processo.status]}`}>
                  {processo.status.charAt(0).toUpperCase() + processo.status.slice(1)}
                </span>
                <span className="badge bg-blue-100 text-blue-700">
                  {tipoProcessoLabels[processo.tipo]}
                </span>
              </div>
              <h1 className="text-xl font-bold text-gray-900 font-mono">{processo.numero}</h1>
              <p className="text-gray-500 text-sm mt-0.5">{processo.descricao}</p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="btn-secondary" onClick={openEdit}>
              <Edit size={15} /> Editar
            </button>
            <button className="btn-danger" onClick={handleDelete}>
              <Trash2 size={15} /> Excluir
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5 border-t border-gray-100">
          <div className="flex items-start gap-2">
            <User size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Cliente</p>
              <p className="text-sm font-medium text-gray-900">{processo.cliente}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Parte Contrária</p>
              <p className="text-sm font-medium text-gray-900">{processo.parteContraria || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Building size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Tribunal / Vara</p>
              <p className="text-sm font-medium text-gray-900">{processo.tribunal} - {processo.vara || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Gavel size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Juiz(a)</p>
              <p className="text-sm font-medium text-gray-900">{processo.juiz || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <User size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Advogado Responsável</p>
              <p className="text-sm font-medium text-gray-900">{processo.advogadoResponsavel}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Calendar size={16} className="text-gray-400 mt-0.5" />
            <div>
              <p className="text-xs text-gray-400">Data de Abertura</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(processo.dataAbertura)}</p>
            </div>
          </div>
          {processo.valor && (
            <div className="flex items-start gap-2">
              <BadgeDollarSign size={16} className="text-gray-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-400">Valor da Causa</p>
                <p className="text-sm font-medium text-gray-900">{formatCurrency(processo.valor)}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Movimentações */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-blue-500" />
              Movimentações ({procMovs.length})
            </h2>
            <button
              className="btn-primary text-xs py-1.5 px-3"
              onClick={() => setMovModalOpen(true)}
            >
              <Plus size={14} /> Nova
            </button>
          </div>
          <div className="space-y-3">
            {procMovs.length === 0 && (
              <p className="text-gray-400 text-sm text-center py-6">Nenhuma movimentação registrada</p>
            )}
            {procMovs.map((m) => (
              <div key={m.id} className="border border-gray-100 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText size={12} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{m.descricao}</p>
                      <div className="flex gap-2 mt-0.5">
                        <span className="badge bg-gray-100 text-gray-600">
                          {tipoMovimentacaoLabels[m.tipo]}
                        </span>
                        {m.responsavel && (
                          <span className="text-xs text-gray-400">{m.responsavel}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 flex-shrink-0">{formatDate(m.data)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Prazos & Honorários */}
        <div className="space-y-5">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-orange-500" /> Prazos ({procPrazos.length})
              </h2>
              <Link href="/prazos" className="text-xs text-primary-700 hover:underline">Ver todos</Link>
            </div>
            <div className="space-y-2">
              {procPrazos.length === 0 && (
                <p className="text-gray-400 text-xs text-center py-3">Nenhum prazo</p>
              )}
              {procPrazos.map((p) => (
                <div key={p.id} className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-900 truncate">{p.descricao}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`badge ${prazoStatusColors[p.status]}`}>{p.status}</span>
                    <span className="text-xs text-gray-500">{formatDate(p.dataVencimento)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                <BadgeDollarSign size={16} className="text-green-500" /> Honorários ({procHonorarios.length})
              </h2>
              <Link href="/honorarios" className="text-xs text-primary-700 hover:underline">Ver todos</Link>
            </div>
            <div className="space-y-2">
              {procHonorarios.length === 0 && (
                <p className="text-gray-400 text-xs text-center py-3">Nenhum honorário</p>
              )}
              {procHonorarios.map((h) => (
                <div key={h.id} className="p-2 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-900">{formatCurrency(h.valor)}</p>
                  <p className="text-xs text-gray-500">{h.descricao}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Movimentacao Modal */}
      <Modal
        open={movModalOpen}
        onClose={() => setMovModalOpen(false)}
        title="Nova Movimentação"
        size="lg"
      >
        <form onSubmit={handleAddMovimentacao} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Data *</label>
              <input
                className="input"
                type="date"
                value={movForm.data}
                onChange={(e) => setMovForm({ ...movForm, data: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Tipo *</label>
              <select
                className="select"
                value={movForm.tipo}
                onChange={(e) => setMovForm({ ...movForm, tipo: e.target.value as MovimentacaoTipo })}
              >
                {Object.entries(tipoMovimentacaoLabels).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Descrição *</label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Descreva a movimentação..."
                value={movForm.descricao}
                onChange={(e) => setMovForm({ ...movForm, descricao: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Responsável</label>
              <input
                className="input"
                placeholder="Nome do responsável"
                value={movForm.responsavel}
                onChange={(e) => setMovForm({ ...movForm, responsavel: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Documento (link/referência)</label>
              <input
                className="input"
                placeholder="Referência do documento"
                value={movForm.documento}
                onChange={(e) => setMovForm({ ...movForm, documento: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setMovModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Plus size={16} /> Registrar
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Processo Modal */}
      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar Processo" size="xl">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Número do Processo</label>
              <input
                className="input font-mono"
                value={editForm.numero ?? ""}
                onChange={(e) => setEditForm({ ...editForm, numero: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Cliente</label>
              <input
                className="input"
                value={editForm.cliente ?? ""}
                onChange={(e) => setEditForm({ ...editForm, cliente: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Parte Contrária</label>
              <input
                className="input"
                value={editForm.parteContraria ?? ""}
                onChange={(e) => setEditForm({ ...editForm, parteContraria: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Tribunal</label>
              <input
                className="input"
                value={editForm.tribunal ?? ""}
                onChange={(e) => setEditForm({ ...editForm, tribunal: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Vara</label>
              <input
                className="input"
                value={editForm.vara ?? ""}
                onChange={(e) => setEditForm({ ...editForm, vara: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="select"
                value={editForm.status ?? "ativo"}
                onChange={(e) => setEditForm({ ...editForm, status: e.target.value as ProcessoStatus })}
              >
                <option value="ativo">Ativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="arquivado">Arquivado</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>
            <div>
              <label className="label">Valor da Causa</label>
              <input
                className="input"
                type="number"
                value={editForm.valor ?? ""}
                onChange={(e) => setEditForm({ ...editForm, valor: parseFloat(e.target.value) })}
              />
            </div>
            <div className="col-span-2">
              <label className="label">Descrição</label>
              <textarea
                className="textarea"
                rows={3}
                value={editForm.descricao ?? ""}
                onChange={(e) => setEditForm({ ...editForm, descricao: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Edit size={16} /> Salvar Alterações
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
