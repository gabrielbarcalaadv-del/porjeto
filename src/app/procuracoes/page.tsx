"use client";
import { useState } from "react";
import { Plus, Search, Stamp, Trash2, Eye, Calendar, User, AlertTriangle } from "lucide-react";
import { useStore } from "@/lib/store";
import { formatDate, daysUntil } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";

const emptyForm = {
  processoId: "",
  outorgante: "",
  outorgado: "",
  poderes: "Ad judicia et extra",
  dataEmissao: new Date().toISOString().slice(0, 10),
  dataValidade: "",
  cartorio: "",
  livro: "",
  folha: "",
  observacoes: "",
};

export default function ProcuracoesPage() {
  const { procuracoes, processos, addProcuracao, deleteProcuracao } = useStore();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [viewModal, setViewModal] = useState<typeof procuracoes[0] | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = procuracoes.filter((p) => {
    const q = search.toLowerCase();
    return (
      !q ||
      p.outorgante.toLowerCase().includes(q) ||
      p.outorgado.toLowerCase().includes(q) ||
      p.poderes.toLowerCase().includes(q)
    );
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addProcuracao({
      ...form,
      processoId: form.processoId || undefined,
      dataValidade: form.dataValidade || undefined,
      cartorio: form.cartorio || undefined,
      livro: form.livro || undefined,
      folha: form.folha || undefined,
      observacoes: form.observacoes || undefined,
    });
    setModalOpen(false);
    setForm(emptyForm);
  }

  function validadeStatus(dataValidade?: string) {
    if (!dataValidade) return null;
    const days = daysUntil(dataValidade);
    if (days < 0) return { label: "Vencida", color: "bg-red-100 text-red-700" };
    if (days <= 30) return { label: `Vence em ${days}d`, color: "bg-orange-100 text-orange-700" };
    return { label: "Válida", color: "bg-green-100 text-green-700" };
  }

  return (
    <div>
      <PageHeader
        title="Procurações"
        subtitle={`${procuracoes.length} procuração(ões) cadastrada(s)`}
        action={
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={16} />
            Nova Procuração
          </button>
        }
      />

      {/* Search */}
      <div className="card p-4 mb-5">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Buscar por outorgante, outorgado ou poderes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Outorgante</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Outorgado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Poderes</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Emissão</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Validade</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Processo</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    <Stamp size={32} className="mx-auto mb-2 opacity-30" />
                    <p>Nenhuma procuração encontrada</p>
                  </td>
                </tr>
              )}
              {filtered.map((proc) => {
                const processo = processos.find((p) => p.id === proc.processoId);
                const vs = validadeStatus(proc.dataValidade);
                return (
                  <tr key={proc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{proc.outorgante}</td>
                    <td className="px-4 py-3 text-gray-700 max-w-[200px]">
                      <p className="truncate" title={proc.outorgado}>{proc.outorgado}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600 max-w-[200px]">
                      <p className="truncate" title={proc.poderes}>{proc.poderes}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(proc.dataEmissao)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {vs ? (
                        <span className={`badge ${vs.color}`}>{vs.label}</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Sem validade</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {processo ? (
                        <span className="font-mono text-xs">{processo.numero}</span>
                      ) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setViewModal(proc)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Visualizar"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Excluir esta procuração?")) deleteProcuracao(proc.id);
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      {viewModal && (
        <Modal open={!!viewModal} onClose={() => setViewModal(null)} title="Detalhes da Procuração" size="lg">
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Partes</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Outorgante</p>
                  <p className="font-semibold text-gray-900">{viewModal.outorgante}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Outorgado</p>
                  <p className="font-semibold text-gray-900">{viewModal.outorgado}</p>
                </div>
              </div>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Poderes Outorgados</p>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                <p className="text-sm text-gray-800">{viewModal.poderes}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-400">Data de Emissão</p>
                <p className="font-medium text-gray-900">{formatDate(viewModal.dataEmissao)}</p>
              </div>
              {viewModal.dataValidade && (
                <div>
                  <p className="text-xs text-gray-400">Data de Validade</p>
                  <p className="font-medium text-gray-900">{formatDate(viewModal.dataValidade)}</p>
                </div>
              )}
              {viewModal.cartorio && (
                <div>
                  <p className="text-xs text-gray-400">Cartório</p>
                  <p className="font-medium text-gray-900">{viewModal.cartorio}</p>
                </div>
              )}
              {viewModal.livro && (
                <div>
                  <p className="text-xs text-gray-400">Livro / Folha</p>
                  <p className="font-medium text-gray-900">{viewModal.livro} / {viewModal.folha}</p>
                </div>
              )}
            </div>
            {viewModal.observacoes && (
              <div>
                <p className="text-xs text-gray-400 mb-1">Observações</p>
                <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{viewModal.observacoes}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova Procuração" size="xl">
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Outorgante *</label>
              <input
                className="input"
                placeholder="Nome de quem outorga"
                value={form.outorgante}
                onChange={(e) => setForm({ ...form, outorgante: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Outorgado *</label>
              <input
                className="input"
                placeholder="Nome do advogado - OAB/XX XXXXXX"
                value={form.outorgado}
                onChange={(e) => setForm({ ...form, outorgado: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Data de Emissão *</label>
              <input
                className="input"
                type="date"
                value={form.dataEmissao}
                onChange={(e) => setForm({ ...form, dataEmissao: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Data de Validade</label>
              <input
                className="input"
                type="date"
                value={form.dataValidade}
                onChange={(e) => setForm({ ...form, dataValidade: e.target.value })}
              />
            </div>
            <div className="col-span-2">
              <label className="label">Poderes Outorgados *</label>
              <textarea
                className="textarea"
                rows={3}
                placeholder="Descreva os poderes outorgados..."
                value={form.poderes}
                onChange={(e) => setForm({ ...form, poderes: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="label">Cartório</label>
              <input
                className="input"
                placeholder="Nome do cartório"
                value={form.cartorio}
                onChange={(e) => setForm({ ...form, cartorio: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label">Livro</label>
                <input
                  className="input"
                  placeholder="Nº Livro"
                  value={form.livro}
                  onChange={(e) => setForm({ ...form, livro: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Folha</label>
                <input
                  className="input"
                  placeholder="Nº Folha"
                  value={form.folha}
                  onChange={(e) => setForm({ ...form, folha: e.target.value })}
                />
              </div>
            </div>
            <div className="col-span-2">
              <label className="label">Observações</label>
              <textarea
                className="textarea"
                rows={2}
                placeholder="Observações adicionais..."
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
              <Plus size={16} /> Cadastrar Procuração
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
