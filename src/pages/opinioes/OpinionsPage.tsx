import { useEffect, useMemo, useState } from "react";
import "./OpinionsPage.css";
import { api } from "../../services/api/api";

type Opinion = {
  id: number | string;
  usuario_id?: number | string;
  nome?: string;
  telefone?: string;
  bairro?: string;
  campanha?: string;
  horario?: string | null;
  acao?: string;
  opiniao?: string;
  outra_opiniao?: string;
  tipo_opiniao?: string;
  texto_opiniao?: string;
};

const fallbackOpinions: Opinion[] = [
  {
    id: "demo-1",
    nome: "Ana Costa",
    telefone: "83999990001",
    bairro: "Centro",
    campanha: "Conecta Cidade",
    horario: "2025-01-24T09:10:00Z",
    opiniao: "Denúncia total",
    texto_opiniao: "Quero mais espaços verdes e ciclovias integradas.",
  },
  {
    id: "demo-2",
    nome: "Bruno Lima",
    telefone: "83999990002",
    bairro: "Altiplano",
    horario: "2025-01-24T11:05:00Z",
    tipo_opiniao: "Sugestão",
    opiniao: "Sugestão",
    texto_opiniao: "Transporte noturno com mais linhas de bairro.",
  },
  {
    id: "demo-3",
    nome: "Carla Souza",
    telefone: "83999990003",
    bairro: "Bessa",
    horario: "2025-01-23T19:45:00Z",
    tipo_opiniao: "Reclamação",
    opiniao: "Reclamação",
    texto_opiniao: "Coleta de lixo atrasou de novo esta semana.",
  },
  {
    id: "demo-4",
    nome: "Diego Melo",
    telefone: "83999990004",
    bairro: "Tambiá",
    horario: "2025-01-22T08:35:00Z",
    tipo_opiniao: "Elogio",
    opiniao: "Elogio",
    texto_opiniao: "Atendimento rápido no posto de saúde da praia.",
  },
  {
    id: "demo-5",
    nome: "Elaine Freitas",
    telefone: "83999990005",
    bairro: "Bancários",
    horario: "2025-01-20T16:00:00Z",
    tipo_opiniao: "Sugestão",
    opiniao: "Sugestão",
    texto_opiniao: "Plante mais árvores nas praças do bairro.",
  },
  {
    id: "demo-6",
    nome: "Filipe Rocha",
    telefone: "83999990006",
    bairro: "Cabo Branco",
    horario: "2025-01-19T12:10:00Z",
    tipo_opiniao: "Denúncia",
    opiniao: "Denúncia",
    texto_opiniao: "Excelente iniciativa de ouvir a população.",
  },
];

const normalizeOpinion = (raw: any, index: number): Opinion => {
  const user = raw?.usuario || raw?.user || {};
  const id = raw?.id ?? raw?.opiniao_id ?? raw?.uuid ?? `local-${index}`;
  const horario = raw?.horario ?? raw?.created_at ?? raw?.data ?? null;

  return {
    id,
    usuario_id: raw?.usuario_id ?? user?.id,
    nome: raw?.nome ?? user?.nome ?? "Visitante",
    telefone: raw?.telefone ?? user?.telefone ?? "",
    bairro: raw?.bairro ?? user?.bairro ?? "",
    campanha: raw?.campanha ?? user?.campanha ?? "",
    horario,
    acao: raw?.acao ?? raw?.action ?? "",
    opiniao: raw?.opiniao ?? raw?.opinion ?? "",
    outra_opiniao: raw?.outra_opiniao ?? raw?.outro ?? "",
    tipo_opiniao: raw?.tipo_opiniao ?? raw?.tipo ?? raw?.categoria ?? "",
    texto_opiniao:
      raw?.texto_opiniao ??
      raw?.texto ??
      raw?.comentario ??
      raw?.mensagem ??
      "",
  };
};

const formatDate = (value?: string | null) => {
  if (!value) return "Instante";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recente";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const uniqueCountBy = (
  items: Opinion[],
  selector: (item: Opinion) => string,
) => {
  const set = new Set<string>();
  items.forEach((item) => {
    const key = selector(item);
    if (key) set.add(key);
  });
  return set.size;
};

function OpinionsPage() {
  const [opinions, setOpinions] = useState<Opinion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadOpinions = async () => {
      setLoading(true);
      try {
        const response = await api.get("/opiniao");
        const payload = Array.isArray(response.data)
          ? response.data
          : (response.data?.data ?? []);
        const normalized = payload
          .map((item: any, index: number) => normalizeOpinion(item, index))
          .filter((item: Opinion) => item && item.id);
        setOpinions(normalized.length ? normalized : fallbackOpinions);
        setError("");
      } catch (err) {
        setError("Mostrando opiniões em modo demonstração.");
        setOpinions(fallbackOpinions);
      } finally {
        setLoading(false);
      }
    };

    loadOpinions();
  }, []);

  const opinionTypes = useMemo(() => {
    const set = new Set<string>();
    opinions.forEach((item) => {
      if (item.tipo_opiniao) set.add(item.tipo_opiniao);
    });
    return Array.from(set);
  }, [opinions]);

  const filteredOpinions = useMemo(() => {
    const term = search.toLowerCase();
    return opinions.filter((item) => {
      const matchesType =
        filterType === "all" || item.tipo_opiniao === filterType;
      const matchesSearch =
        !term ||
        (item.nome && item.nome.toLowerCase().includes(term)) ||
        (item.texto_opiniao &&
          item.texto_opiniao.toLowerCase().includes(term)) ||
        (item.bairro && item.bairro.toLowerCase().includes(term));
      return matchesType && matchesSearch;
    });
  }, [opinions, filterType, search]);

  const tickerItems = filteredOpinions.length
    ? filteredOpinions
    : fallbackOpinions;

  return (
    <div className="app-shell">
      <div className="bg-blob blob-a" />
      <div className="bg-blob blob-b" />
      <div className="bg-blob blob-c" />

      <header className="hero">
        <div className="badge">Monitorando a voz da cidade</div>
        <h1>
          Opinião em tempo real <span className="gradient-text">sem login</span>
        </h1>
        <p className="lede">
          Veja o que as pessoas estão falando, explore temas e acompanhe como as
          opiniões evoluem. Inspirado em sites de streaming de dados com foco em
          clareza e movimento.
        </p>

        <div className="hero-grid">
          <div className="stat-card">
            <div className="stat-label">Opiniões ativas</div>
            <div className="stat-value">
              {opinions.length || fallbackOpinions.length}
            </div>
            <div className="stat-helper">
              Atualiza sozinho quando o API responder.
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Usuários únicos</div>
            <div className="stat-value">
              {uniqueCountBy(
                opinions.length ? opinions : fallbackOpinions,
                (op) => (op.telefone || "").replace(/\D/g, ""),
              )}
            </div>
            <div className="stat-helper">
              Um usuário pode ter várias opiniões.
            </div>
          </div>
          <div className="stat-card wide">
            <div className="stat-label">Clima geral</div>
            <div className="stat-pills">
              {["Sugestão", "Reclamação", "Elogio"].map((pill) => (
                <span key={pill} className="pill">
                  {pill}
                </span>
              ))}
            </div>
            {error ? <div className="stat-error">{error}</div> : null}
          </div>
        </div>
      </header>

      <section className="control-panel">
        <div className="search-box">
          <label htmlFor="search">Buscar</label>
          <input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filtrar por nome, bairro ou texto..."
          />
        </div>
        <div className="filters">
          <button
            className={filterType === "all" ? "chip active" : "chip"}
            onClick={() => setFilterType("all")}
            type="button"
          >
            Todas
          </button>
          {opinionTypes.map((type) => (
            <button
              key={type}
              className={filterType === type ? "chip active" : "chip"}
              onClick={() => setFilterType(type)}
              type="button"
            >
              {type}
            </button>
          ))}
        </div>
      </section>

      <section className="ticker">
        <div className="ticker-title">Fluxo ao vivo</div>
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="ticker-item">
              <span className="dot" />
              <strong>{item.nome}</strong>
              <span className="muted">
                ({item.bairro || "Bairro desconhecido"})
              </span>
              <span className="pill small">{item.tipo_opiniao || "Outro"}</span>
              <span className="text">{item.texto_opiniao || item.opiniao}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="opinion-grid">
        {loading ? (
          Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="skeleton" />
          ))
        ) : filteredOpinions.length ? (
          filteredOpinions.map((item) => (
            <article key={item.id} className="opinion-card">
              <div className="card-header">
                <div>
                  <div className="name">{item.nome || "Visitante"}</div>
                  <div className="meta">
                    {item.bairro || "Bairro não informado"} -{" "}
                    {formatDate(item.horario)}
                  </div>
                </div>
                <span className="pill">{item.tipo_opiniao || "Outro"}</span>
              </div>
              <p className="opinion-text">
                {item.texto_opiniao || item.opiniao || "Sem texto"}
              </p>
              <div className="card-footer">
                <div className="tags">
                  {item.campanha ? (
                    <span className="tag">Campanha: {item.campanha}</span>
                  ) : null}
                  {item.acao ? (
                    <span className="tag">Ação: {item.acao}</span>
                  ) : null}
                  {item.outra_opiniao ? (
                    <span className="tag">Outra: {item.outra_opiniao}</span>
                  ) : null}
                </div>
                <div className="pill subtle">
                  Usuário {item.usuario_id || "novo"}
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty-state">
            Nenhuma opinião encontrada com o filtro atual.
          </div>
        )}
      </section>
    </div>
  );
}

export default OpinionsPage;
