"use client";
import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Scale,
  Briefcase,
  Save,
  CheckCircle,
} from "lucide-react";
import { useStore } from "@/lib/store";
import PageHeader from "@/components/PageHeader";

function getInitials(nome: string) {
  return nome
    .split(" ")
    .filter((w) => w.length > 2)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

export default function PerfilPage() {
  const { userProfile, updateUserProfile } = useStore();
  const [form, setForm] = useState({ ...userProfile });
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateUserProfile(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleChange(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }

  return (
    <div>
      <PageHeader
        title="Meu Perfil"
        subtitle="Gerencie suas informações pessoais e profissionais"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <div className="card p-6 flex flex-col items-center text-center gap-4">
          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {getInitials(form.nome || userProfile.nome)}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg leading-tight">
              {form.nome || "—"}
            </p>
            <p className="text-primary-700 text-sm font-medium mt-0.5">
              {form.oab || "—"}
            </p>
            {form.especialidade && (
              <p className="text-gray-500 text-xs mt-1">{form.especialidade}</p>
            )}
          </div>
          <div className="w-full border-t border-gray-100 pt-4 space-y-2 text-left">
            {form.email && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Mail size={13} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{form.email}</span>
              </div>
            )}
            {form.telefone && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Phone size={13} className="text-gray-400 flex-shrink-0" />
                <span>{form.telefone}</span>
              </div>
            )}
            {form.escritorio && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Building size={13} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{form.escritorio}</span>
              </div>
            )}
            {form.endereco && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <MapPin size={13} className="text-gray-400 flex-shrink-0" />
                <span className="truncate">{form.endereco}</span>
              </div>
            )}
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-2 card p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <User size={18} className="text-primary-600" />
            Dados do Advogado
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Nome */}
              <div className="sm:col-span-2">
                <label className="label">
                  <span className="flex items-center gap-1.5">
                    <User size={13} className="text-gray-400" />
                    Nome Completo *
                  </span>
                </label>
                <input
                  className="input"
                  placeholder="Ex: Dr. João Paulo Ferreira"
                  value={form.nome}
                  onChange={(e) => handleChange("nome", e.target.value)}
                  required
                />
              </div>

              {/* OAB */}
              <div>
                <label className="label">
                  <span className="flex items-center gap-1.5">
                    <Scale size={13} className="text-gray-400" />
                    Número OAB *
                  </span>
                </label>
                <input
                  className="input"
                  placeholder="Ex: OAB/SP 123456"
                  value={form.oab}
                  onChange={(e) => handleChange("oab", e.target.value)}
                  required
                />
              </div>

              {/* Especialidade */}
              <div>
                <label className="label">
                  <span className="flex items-center gap-1.5">
                    <Briefcase size={13} className="text-gray-400" />
                    Especialidade
                  </span>
                </label>
                <input
                  className="input"
                  placeholder="Ex: Direito Civil e Trabalhista"
                  value={form.especialidade}
                  onChange={(e) => handleChange("especialidade", e.target.value)}
                />
              </div>

              {/* Email */}
              <div>
                <label className="label">
                  <span className="flex items-center gap-1.5">
                    <Mail size={13} className="text-gray-400" />
                    E-mail
                  </span>
                </label>
                <input
                  className="input"
                  type="email"
                  placeholder="seu@email.com.br"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              {/* Telefone */}
              <div>
                <label className="label">
                  <span className="flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-400" />
                    Telefone / WhatsApp
                  </span>
                </label>
                <input
                  className="input"
                  placeholder="(00) 00000-0000"
                  value={form.telefone}
                  onChange={(e) => handleChange("telefone", e.target.value)}
                />
              </div>

              {/* Escritório */}
              <div className="sm:col-span-2">
                <label className="label">
                  <span className="flex items-center gap-1.5">
                    <Building size={13} className="text-gray-400" />
                    Nome do Escritório
                  </span>
                </label>
                <input
                  className="input"
                  placeholder="Ex: Ferreira & Associados Advocacia"
                  value={form.escritorio}
                  onChange={(e) => handleChange("escritorio", e.target.value)}
                />
              </div>

              {/* Endereço */}
              <div className="sm:col-span-2">
                <label className="label">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-gray-400" />
                    Endereço do Escritório
                  </span>
                </label>
                <input
                  className="input"
                  placeholder="Ex: Av. Paulista, 1000 - São Paulo/SP"
                  value={form.endereco}
                  onChange={(e) => handleChange("endereco", e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                As informações são salvas localmente no navegador.
              </p>
              <button
                type="submit"
                className={`btn-primary transition-all ${
                  saved ? "bg-green-600 hover:bg-green-700" : ""
                }`}
              >
                {saved ? (
                  <>
                    <CheckCircle size={16} />
                    Salvo!
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Salvar Alterações
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
