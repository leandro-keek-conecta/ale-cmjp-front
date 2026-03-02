import type { InputType } from "@/components/Forms";

type SemanticOpinionFieldKey =
  | "opiniao"
  | "outra_opiniao"
  | "tipo_opiniao"
  | "texto_opiniao";

type OpinionSummaryFields = {
  tema?: string;
  tipo?: string;
  texto_opiniao?: string;
};

const OPINION_CATEGORY_HINTS = [
  "educacao",
  "saude",
  "infraestrutura",
  "seguranca",
  "mobilidade",
  "outros",
] as const;

const OPINION_TYPE_HINTS = ["sugestao", "reclamacao", "elogio"] as const;

function normalizeText(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function toStringValue(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const joined = value
      .map((item) => toStringValue(item))
      .filter((item): item is string => Boolean(item))
      .join(", ")
      .trim();

    return joined || undefined;
  }

  return undefined;
}

function includesAllTerms(source: string, terms: string[]) {
  return terms.every((term) => source.includes(term));
}

function includesAnyTerm(source: string, terms: string[]) {
  return terms.some((term) => source.includes(term));
}

function getInputDescriptor(input: InputType<any>) {
  const name = normalizeText(input.name);
  const title = normalizeText(input.title);
  const placeholder = normalizeText(input.placeholder);
  const combined = [name, title, placeholder].filter(Boolean).join(" ");

  return {
    name,
    title,
    placeholder,
    combined,
    type: input.type,
    optionLabels: (input.selectOptions ?? [])
      .map((option) => normalizeText(option.label))
      .filter(Boolean),
  };
}

function scoreOpinionTopicField(input: InputType<any>) {
  if (input.type !== "Select") return Number.NEGATIVE_INFINITY;

  const descriptor = getInputDescriptor(input);
  let score = 0;

  if (descriptor.name === "opiniao") score += 100;
  if (descriptor.name.startsWith("opiniao ")) score += 90;
  if (descriptor.name.includes("tema")) score += 70;
  if (descriptor.title.includes("tema")) score += 70;
  if (
    descriptor.combined.includes("opiniao") &&
    !descriptor.combined.includes("tipo")
  ) {
    score += 60;
  }
  if (
    descriptor.optionLabels.length &&
    descriptor.optionLabels.some((option) =>
      includesAnyTerm(option, [...OPINION_CATEGORY_HINTS]),
    )
  ) {
    score += 40;
  }

  return score;
}

function scoreOtherOpinionField(input: InputType<any>) {
  if (input.type !== "text" && input.type !== "textarea") {
    return Number.NEGATIVE_INFINITY;
  }

  const descriptor = getInputDescriptor(input);
  let score = 0;

  if (descriptor.name === "outra opiniao") score += 100;
  if (descriptor.name.includes("outra") && descriptor.name.includes("opiniao")) {
    score += 90;
  }
  if (
    descriptor.title.includes("outra") &&
    descriptor.title.includes("opiniao")
  ) {
    score += 90;
  }
  if (
    descriptor.placeholder.includes("outra") &&
    descriptor.placeholder.includes("opiniao")
  ) {
    score += 80;
  }

  return score;
}

function scoreOpinionTypeField(input: InputType<any>) {
  if (input.type !== "Select") return Number.NEGATIVE_INFINITY;

  const descriptor = getInputDescriptor(input);
  let score = 0;

  if (descriptor.name === "tipo opiniao") score += 100;
  if (
    descriptor.name.includes("tipo") &&
    descriptor.name.includes("opiniao")
  ) {
    score += 90;
  }
  if (descriptor.title.includes("tipo")) score += 70;
  if (descriptor.placeholder.includes("tipo")) score += 60;
  if (
    descriptor.optionLabels.length &&
    descriptor.optionLabels.some((option) =>
      includesAnyTerm(option, [...OPINION_TYPE_HINTS]),
    )
  ) {
    score += 40;
  }

  return score;
}

function scoreOpinionTextField(input: InputType<any>) {
  if (input.type !== "text" && input.type !== "textarea") {
    return Number.NEGATIVE_INFINITY;
  }

  const descriptor = getInputDescriptor(input);
  let score = 0;

  if (descriptor.name === "texto opiniao") score += 120;
  if (includesAllTerms(descriptor.name, ["texto", "opiniao"])) score += 95;
  if (includesAllTerms(descriptor.name, ["descricao", "opiniao"])) score += 85;
  if (includesAnyTerm(descriptor.name, ["area de texto", "textarea"])) score += 60;

  if (
    descriptor.combined.includes("opiniao") &&
    includesAnyTerm(descriptor.combined, [
      "digite",
      "descreva",
      "escreva",
      "texto",
      "descricao",
      "comentario",
      "mensagem",
      "relato",
      "detalhe",
    ])
  ) {
    score += 90;
  }

  if (
    includesAnyTerm(descriptor.combined, [
      "descricao",
      "comentario",
      "mensagem",
      "relato",
      "detalhe",
    ])
  ) {
    score += 20;
  }

  if (input.type === "textarea") score += 25;

  return score;
}

function pickBestFieldName(
  inputs: InputType<any>[],
  values: Record<string, unknown>,
  scorer: (input: InputType<any>) => number,
  minimumScore: number,
) {
  let bestName: string | undefined;
  let bestScore = Number.NEGATIVE_INFINITY;

  inputs.forEach((input) => {
    const inputName = String(input.name);
    const value = toStringValue(values[inputName]);
    if (!value) return;

    const score = scorer(input);
    if (score > bestScore) {
      bestScore = score;
      bestName = inputName;
    }
  });

  if (bestScore < minimumScore) return undefined;
  return bestName;
}

function getCanonicalFieldValue(
  key: SemanticOpinionFieldKey,
  inputs: InputType<any>[],
  values: Record<string, unknown>,
) {
  const directValue = toStringValue(values[key]);
  if (directValue) return directValue;

  const scoreConfig: Record<
    SemanticOpinionFieldKey,
    {
      scorer: (input: InputType<any>) => number;
      minimumScore: number;
    }
  > = {
    opiniao: { scorer: scoreOpinionTopicField, minimumScore: 60 },
    outra_opiniao: { scorer: scoreOtherOpinionField, minimumScore: 70 },
    tipo_opiniao: { scorer: scoreOpinionTypeField, minimumScore: 60 },
    texto_opiniao: { scorer: scoreOpinionTextField, minimumScore: 60 },
  };

  const config = scoreConfig[key];
  const matchedFieldName = pickBestFieldName(
    inputs,
    values,
    config.scorer,
    config.minimumScore,
  );

  return matchedFieldName ? toStringValue(values[matchedFieldName]) : undefined;
}

export function normalizeOpinionFieldValues(
  inputs: InputType<any>[],
  values: Record<string, unknown>,
) {
  const normalizedValues = { ...values };

  ([
    "opiniao",
    "outra_opiniao",
    "tipo_opiniao",
    "texto_opiniao",
  ] as SemanticOpinionFieldKey[]).forEach((key) => {
    const resolvedValue = getCanonicalFieldValue(key, inputs, normalizedValues);
    if (!resolvedValue) return;
    normalizedValues[key] = resolvedValue;
  });

  return normalizedValues;
}

export function buildOpinionSummaryFields(
  inputs: InputType<any>[],
  values: Record<string, unknown>,
): OpinionSummaryFields {
  const normalizedValues = normalizeOpinionFieldValues(inputs, values);
  const tema = toStringValue(normalizedValues.opiniao);
  const outraOpiniao = toStringValue(normalizedValues.outra_opiniao);
  const tipo = toStringValue(normalizedValues.tipo_opiniao);
  const textoOpiniao = toStringValue(normalizedValues.texto_opiniao);

  return {
    tema:
      normalizeText(tema) === "outros" ? outraOpiniao ?? tema : tema,
    tipo,
    texto_opiniao: textoOpiniao,
  };
}
