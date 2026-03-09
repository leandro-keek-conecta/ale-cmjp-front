import { Box } from "@mui/material";
import type {
  PanoramaResponse,
  PanoramaResponseField,
} from "../../../types/panoramaResponse";
import formatDate from "../../../utils/formatDate";
import styles from "./cardUser.module.css";

type CardUserProps = {
  responses: PanoramaResponse[];
};

function asFieldArray(
  fields: PanoramaResponse["fields"],
): PanoramaResponseField[] {
  return Array.isArray(fields) ? fields : [];
}

function getField(response: PanoramaResponse, name: string) {
  const directValue = response[name];
  if (directValue !== undefined && directValue !== null && directValue !== "") {
    return directValue;
  }

  const field = asFieldArray(response.fields).find(
    (entry) => entry.fieldName === name || entry.name === name,
  );

  return field?.value ?? field?.valueNumber ?? null;
}

function toDisplayValue(value: unknown) {
  if (typeof value === "string") {
    return value.trim();
  }

  if (typeof value === "number") {
    return String(value);
  }

  return "";
}

function resolveResponseDate(response: PanoramaResponse) {
  return (
    response.submittedAt ??
    response.completedAt ??
    response.createdAt ??
    response.startedAt ??
    response.horario ??
    null
  );
}

function calculateAge(year: number) {
  const currentYear = new Date().getFullYear();
  return currentYear - year;
}

function toAge(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return calculateAge(value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return calculateAge(parsed);
    }
  }

  return undefined;
}

export default function CardUser({ responses }: CardUserProps) {
  if (!responses.length) {
    return <div className={styles.emptyState}>Nenhum usuÃ¡rio encontrado.</div>;
  }

  return (
    <>
      {responses.map((response) => {
        const nome = toDisplayValue(getField(response, "nome"));
        const sobrenome = toDisplayValue(getField(response, "sobrenome"));
        const telefone = toDisplayValue(getField(response, "telefone"));
        const email = toDisplayValue(getField(response, "email"));
        const bairro = toDisplayValue(getField(response, "bairro"));
        const genero = toDisplayValue(getField(response, "genero"));
        const ano = getField(response, "ano_nascimento");
        const idade = toAge(ano);
        const responseKey = `${response.formId ?? "form"}-${response.id}`;

        return (
          <article key={responseKey} className={styles.userCard}>
            <div className={styles.cardHeader}>
              <div className={styles.name}>
                {nome} {sobrenome}
              </div>
            </div>

            <div className={styles.meta}>
              <span>{bairro || "Bairro nÃ£o informado"}</span>
              <span>{formatDate(resolveResponseDate(response))}</span>
            </div>

            <Box className={styles.userInfo}>
              <p><strong>Telefone:</strong> {telefone || "-"}</p>
              <p><strong>Email:</strong> {email || "-"}</p>
              <p><strong>GÃªnero:</strong> {genero || "-"}</p>
              <p><strong>Idade:</strong> {idade ? `${idade} anos` : "-"}</p>
            </Box>

            <div className={styles.cardFooter}>
              <span className={styles.pill}>UsuÃ¡rio cadastrado</span>
            </div>
          </article>
        );
      })}
    </>
  );
}
