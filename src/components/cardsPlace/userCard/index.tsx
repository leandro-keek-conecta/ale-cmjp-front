import { Box } from "@mui/material";
import formatDate from "../../../utils/formatDate";
import styles from "./cardUser.module.css";

type Field = {
  fieldName: string;
  value: string | null;
  valueNumber?: number | null;
};

type Response = {
  id: number;
  submittedAt: string;
  fields: Field[];
};

type CardUserProps = {
  responses: Response[];
};

function getField(fields: Field[], name: string) {
  const field = fields.find((f) => f.fieldName === name);
  return field?.value || field?.valueNumber || null;
}

function calculateAge(year: number) {
  const currentYear = new Date().getFullYear();
  return currentYear - year;
}

export default function CardUser({ responses }: CardUserProps) {
  if (!responses.length) {
    return <div className={styles.emptyState}>Nenhum usuário encontrado.</div>;
  }

  return (
    <>
      {responses.map((response) => {
        const nome = getField(response.fields, "nome");
        const sobrenome = getField(response.fields, "sobrenome");
        const telefone = getField(response.fields, "telefone");
        const email = getField(response.fields, "email");
        const bairro = getField(response.fields, "bairro");
        const genero = getField(response.fields, "genero");
        const ano = getField(response.fields, "ano_nascimento");

        const idade =
          typeof ano === "number" ? calculateAge(ano) : undefined;

        return (
          <article key={response.id} className={styles.userCard}>
            <div className={styles.cardHeader}>
              <div className={styles.name}>
                {nome} {sobrenome}
              </div>
            </div>

            <div className={styles.meta}>
              <span>{bairro || "Bairro não informado"}</span>
              <span>{formatDate(response.submittedAt)}</span>
            </div>

            <Box className={styles.userInfo}>
              <p><strong>Telefone:</strong> {telefone || "-"}</p>
              <p><strong>Email:</strong> {email || "-"}</p>
              <p><strong>Gênero:</strong> {genero || "-"}</p>
              <p><strong>Idade:</strong> {idade ? `${idade} anos` : "-"}</p>
            </Box>

            <div className={styles.cardFooter}>
              <span className={styles.pill}>Usuário cadastrado</span>
            </div>
          </article>
        );
      })}
    </>
  );
}