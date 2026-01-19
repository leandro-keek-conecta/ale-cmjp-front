import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import ArrowBackRounded from "@mui/icons-material/ArrowBackRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  DASHBOARD_ALLOWLIST,
  DASHBOARD_MAP,
} from "./dashboardConfig";
import styles from "./EmbedDashboardPage.module.css";

type ValidationResult =
  | { ok: true; url: string; hostname: string }
  | { ok: false; message: string };

const isAllowedHost = (hostname: string) => {
  const normalized = hostname.toLowerCase();
  return DASHBOARD_ALLOWLIST.some(
    (allowed) =>
      normalized === allowed ||
      normalized.endsWith(`.${allowed.toLowerCase()}`)
  );
};

const validateDashboardUrl = (rawUrl?: string | null): ValidationResult => {
  if (!rawUrl) {
    return {
      ok: false,
      message:
        "Informe uma URL pública do dashboard ou utilize um id cadastrado (ex.: /dashboards/embed/powerbi-sample).",
    };
  }

  const cleaned = rawUrl.trim();

  try {
    const parsed = new URL(cleaned);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        ok: false,
        message: "Apenas protocolos http e https são permitidos.",
      };
    }

    if (!isAllowedHost(parsed.hostname)) {
      return {
        ok: false,
        message: `Domínio não permitido: ${parsed.hostname}`,
      };
    }

    return { ok: true, url: parsed.toString(), hostname: parsed.hostname };
  } catch (error) {
    return {
      ok: false,
      message:
        "URL inválida. Use o formato completo, incluindo https:// e sem javascript:/data:.",
    };
  }
};

const resolveDashboardFromId = (id?: string) =>
  id ? DASHBOARD_MAP[id] : undefined;

const EmbedDashboardPage = () => {
  const { id } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string | null>(null);
  const [provider, setProvider] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const queryUrl = useMemo(
    () => searchParams.get("url")?.trim() || "",
    [searchParams]
  );

  useEffect(() => {
    const dashboardFromId = resolveDashboardFromId(id || undefined);

    if (id && !dashboardFromId) {
      setError(
        `O id "${id}" não está cadastrado. Use um id permitido ou passe ?url= com um domínio na allowlist.`
      );
      setCurrentUrl(null);
      setSourceLabel(null);
      setProvider(null);
      setIsLoading(false);
      return;
    }

    const candidateUrl = dashboardFromId?.url || queryUrl;
    const validation = validateDashboardUrl(candidateUrl);

    if (!validation.ok) {
      setError(validation.message);
      setCurrentUrl(null);
      setSourceLabel(null);
      setProvider(null);
      setIsLoading(false);
      return;
    }

    setError(null);
    setCurrentUrl(validation.url);
    setSourceLabel(dashboardFromId?.title || validation.hostname);
    setProvider(dashboardFromId?.provider || null);
    setIsLoading(true);
  }, [id, queryUrl]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError(
      "Não foi possível carregar o dashboard. Verifique se o domínio permite embed ou se a URL continua pública."
    );
    setIsLoading(false);
    setCurrentUrl(null);
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  return (
    <Box className={styles.page}>
      <Box className={styles.toolbar}>
        <Box className={styles.meta}>
          <span className={styles.metaBadge}>
            <InfoOutlined fontSize="small" />
            <span>Embed de dashboard público</span>
          </span>
          <Typography component="h1" className={styles.title}>
            {sourceLabel || "Dashboard embed"}
          </Typography>
          <Typography component="p" className={styles.subtitle}>
            {provider
              ? `Fonte: ${provider}${id ? ` · id: ${id}` : ""}`
              : "Informe um id cadastrado (ex.: /dashboards/embed/powerbi-sample) ou passe ?url= com um domínio permitido."}
          </Typography>
        </Box>
        <Box className={styles.actions}>
          {currentUrl && !error ? (
            <Button
              variant="outlined"
              size="small"
              color="inherit"
              endIcon={<OpenInNewRounded fontSize="small" />}
              href={currentUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Abrir em nova aba
            </Button>
          ) : null}
          <Button
            variant="text"
            color="inherit"
            startIcon={<ArrowBackRounded />}
            onClick={handleGoBack}
          >
            Voltar
          </Button>
        </Box>
      </Box>

      <Box className={styles.viewport}>
        {error ? (
          <Box className={styles.feedback}>
            <div className={styles.feedbackIcon}>
              <ErrorOutlineRounded fontSize="large" />
            </div>
            <Typography component="h2" className={styles.feedbackTitle}>
              Não foi possível exibir o dashboard
            </Typography>
            <Typography component="p" className={styles.feedbackMessage}>
              {error}
            </Typography>
            <div className={styles.feedbackActions}>
              <Button variant="contained" color="inherit" onClick={handleGoBack}>
                Voltar
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => navigate("/")}
              >
                Ir para início
              </Button>
            </div>
          </Box>
        ) : null}

        {currentUrl ? (
          <div className={styles.frameWrapper}>
            {isLoading ? (
              <div className={styles.loadingOverlay}>
                <CircularProgress size={32} thickness={4} />
                <Typography component="p" className={styles.loadingText}>
                  Carregando dashboard...
                </Typography>
              </div>
            ) : null}
            <iframe
              title={sourceLabel || "Dashboard embed"}
              src={currentUrl}
              className={styles.iframe}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
              onLoad={handleLoad}
              onError={handleError}
            />
          </div>
        ) : null}
      </Box>
    </Box>
  );
};

export default EmbedDashboardPage;
