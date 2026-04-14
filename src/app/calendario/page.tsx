"use client";
import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Receipt,
  Kanban,
  AlertTriangle,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
  isToday,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useStore } from "@/lib/store";
import { formatDate, prioridadeColors, prazoStatusColors } from "@/lib/utils";
import PageHeader from "@/components/PageHeader";
import Modal from "@/components/Modal";

type EventType = "prazo" | "tarefa" | "honorario";

interface CalEvent {
  id: string;
  date: string;
  title: string;
  type: EventType;
  subtitle?: string;
  color: string;
  status?: string;
  prioridade?: string;
}

const typeConfig: Record<EventType, { icon: React.ElementType; bg: string; text: string; border: string }> = {
  prazo: { icon: Clock, bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  tarefa: { icon: Kanban, bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  honorario: { icon: Receipt, bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
};

const typeLabel: Record<EventType, string> = {
  prazo: "Prazo",
  tarefa: "Tarefa",
  honorario: "Honorário",
};

export default function CalendarioPage() {
  const { prazos, tarefas, honorarios, processos } = useStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [filter, setFilter] = useState<EventType | "todos">("todos");

  const events = useMemo<CalEvent[]>(() => {
    const evts: CalEvent[] = [];

    prazos.forEach((p) => {
      if (p.status === "concluido") return;
      const processo = processos.find((pr) => pr.id === p.processoId);
      evts.push({
        id: `prazo-${p.id}`,
        date: p.dataVencimento,
        title: p.descricao,
        type: "prazo",
        subtitle: processo ? processo.cliente : undefined,
        color: "red",
        status: p.status,
        prioridade: p.prioridade,
      });
    });

    tarefas.forEach((t) => {
      if (!t.dataVencimento || t.coluna === "concluido") return;
      evts.push({
        id: `tarefa-${t.id}`,
        date: t.dataVencimento,
        title: t.titulo,
        type: "tarefa",
        subtitle: t.responsavel,
        color: "blue",
        prioridade: t.prioridade,
      });
    });

    honorarios.forEach((h) => {
      if (h.status === "pago" || h.status === "cancelado") return;
      evts.push({
        id: `honor-${h.id}`,
        date: h.vencimento,
        title: `Honorário - ${h.cliente}`,
        type: "honorario",
        subtitle: h.descricao,
        color: "green",
        status: h.status,
      });
    });

    return evts;
  }, [prazos, tarefas, honorarios, processos]);

  const filteredEvents = filter === "todos" ? events : events.filter((e) => e.type === filter);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  function getEventsForDay(day: Date) {
    return filteredEvents.filter((e) => isSameDay(parseISO(e.date), day));
  }

  const selectedEvents = selectedDay ? getEventsForDay(selectedDay) : [];

  const weekLabels = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const upcomingEvents = filteredEvents
    .filter((e) => {
      const d = parseISO(e.date);
      const today = new Date();
      return d >= today;
    })
    .sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
    .slice(0, 10);

  return (
    <div>
      <PageHeader
        title="Calendário de Prazos"
        subtitle="Visão mensal de prazos, tarefas e vencimentos"
      />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar */}
        <div className="xl:col-span-3">
          <div className="card p-5">
            {/* Nav */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentDate((d) => subMonths(d, 1))}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                <h2 className="text-lg font-bold text-gray-900 capitalize">
                  {format(currentDate, "MMMM yyyy", { locale: ptBR })}
                </h2>
                <button
                  onClick={() => setCurrentDate((d) => addMonths(d, 1))}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentDate(new Date())}
                  className="btn-secondary py-1.5 px-3 text-xs"
                >
                  Hoje
                </button>
                {/* Filter */}
                <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                  {(["todos", "prazo", "tarefa", "honorario"] as const).map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                        filter === f
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      {f === "todos" ? "Todos" : typeLabel[f]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 mb-1">
              {weekLabels.map((w) => (
                <div key={w} className="text-center text-xs font-semibold text-gray-400 py-2">
                  {w}
                </div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 border-l border-t border-gray-100">
              {days.map((day) => {
                const dayEvents = getEventsForDay(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isTodayDay = isToday(day);
                const isSelected = selectedDay && isSameDay(day, selectedDay);
                return (
                  <div
                    key={day.toISOString()}
                    className={`border-r border-b border-gray-100 min-h-[90px] p-1.5 cursor-pointer transition-colors ${
                      isCurrentMonth ? "bg-white hover:bg-gray-50" : "bg-gray-50"
                    } ${isSelected ? "ring-2 ring-primary-500 ring-inset" : ""}`}
                    onClick={() => setSelectedDay(isSameDay(day, selectedDay ?? new Date(0)) ? null : day)}
                  >
                    <div
                      className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${
                        isTodayDay
                          ? "bg-primary-600 text-white"
                          : isCurrentMonth
                          ? "text-gray-900"
                          : "text-gray-300"
                      }`}
                    >
                      {format(day, "d")}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((evt) => {
                        const cfg = typeConfig[evt.type];
                        return (
                          <div
                            key={evt.id}
                            className={`text-xs px-1.5 py-0.5 rounded-md truncate ${cfg.bg} ${cfg.text} border ${cfg.border}`}
                            title={evt.title}
                          >
                            {evt.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-gray-400 px-1">
                          +{dayEvents.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
              {Object.entries(typeConfig).map(([type, cfg]) => (
                <div key={type} className="flex items-center gap-1.5">
                  <div className={`w-3 h-3 rounded ${cfg.bg} border ${cfg.border}`} />
                  <span className="text-xs text-gray-500">{typeLabel[type as EventType]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Selected day events */}
          {selectedDay && (
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CalendarDays size={16} className="text-primary-600" />
                {format(selectedDay, "dd 'de' MMMM", { locale: ptBR })}
              </h3>
              {selectedEvents.length === 0 && (
                <p className="text-gray-400 text-xs text-center py-4">Nenhum evento neste dia</p>
              )}
              <div className="space-y-2">
                {selectedEvents.map((evt) => {
                  const cfg = typeConfig[evt.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={evt.id} className={`p-3 rounded-lg ${cfg.bg} border ${cfg.border}`}>
                      <div className="flex items-start gap-2">
                        <Icon size={14} className={`${cfg.text} flex-shrink-0 mt-0.5`} />
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold ${cfg.text} truncate`}>{evt.title}</p>
                          {evt.subtitle && (
                            <p className="text-xs text-gray-500 truncate mt-0.5">{evt.subtitle}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-1">
                            <span className={`badge ${cfg.bg} ${cfg.text} text-xs`}>
                              {typeLabel[evt.type]}
                            </span>
                            {evt.prioridade && (
                              <span className={`badge ${prioridadeColors[evt.prioridade]} text-xs`}>
                                {evt.prioridade}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Upcoming events */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Clock size={16} className="text-orange-500" />
              Próximos Eventos
            </h3>
            {upcomingEvents.length === 0 && (
              <p className="text-gray-400 text-xs text-center py-4">Nenhum evento futuro</p>
            )}
            <div className="space-y-2">
              {upcomingEvents.map((evt) => {
                const cfg = typeConfig[evt.type];
                const Icon = cfg.icon;
                return (
                  <div
                    key={evt.id}
                    className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedDay(parseISO(evt.date));
                      setCurrentDate(parseISO(evt.date));
                    }}
                  >
                    <div className={`w-7 h-7 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={13} className={cfg.text} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 truncate">{evt.title}</p>
                      <p className="text-xs text-gray-400">{formatDate(evt.date)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
