import { apiPublic } from "../apiPublic/api";
import { api } from "../api/api";

import type { Opinion } from "../../pages/Panorama/Panorama";
import type { UserFormValues } from "../../types/user";
import { getStoredProjectId } from "@/utils/project";

function toText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function toOptionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function toOptionalId(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizeOptions(
  field: Record<string, unknown>,
  options?: { includeFieldId?: boolean },
) {
  const includeFieldId = options?.includeFieldId ?? true;
  const fieldOptions =
    (field.options as Record<string, unknown> | undefined) ?? {};
  const normalized: Record<string, unknown> = { ...fieldOptions };

  if (includeFieldId) {
    const fieldId = toText(field.id);
    if (fieldId) {
      normalized.id = fieldId;
    }
  }

  const placeholder = toText(field.placeholder);
  if (placeholder) {
    normalized.placeholder = placeholder;
  }

  const helpText = toText(field.helpText);
  if (helpText) {
    normalized.helpText = helpText;
  }

  const helpStyle = toText(field.helpStyle);
  if (helpStyle) {
    normalized.helpStyle = helpStyle;
  }

  const layoutFromField = field.layout as Record<string, unknown> | undefined;
  const layoutFromOptions =
    fieldOptions.layout as Record<string, unknown> | undefined;
  const row = toOptionalNumber(layoutFromField?.row ?? layoutFromOptions?.row);
  const column = toOptionalNumber(
    layoutFromField?.column ?? layoutFromOptions?.column,
  );
  if (typeof row === "number" || typeof column === "number") {
    normalized.layout = {
      ...(typeof row === "number" ? { row } : {}),
      ...(typeof column === "number" ? { column } : {}),
    };
  }

  const min = toOptionalNumber(field.min);
  if (typeof min === "number") {
    normalized.min = min;
  }

  const max = toOptionalNumber(field.max);
  if (typeof max === "number") {
    normalized.max = max;
  }

  const rows = toOptionalNumber(field.rows);
  if (typeof rows === "number") {
    normalized.rows = rows;
  }

  const itemsRaw = Array.isArray(fieldOptions.items)
    ? fieldOptions.items
    : Array.isArray(fieldOptions.selectOptions)
      ? fieldOptions.selectOptions
      : [];

  const items = itemsRaw
    .map((item) => toText(item))
    .filter(Boolean);

  if (items.length) {
    normalized.items = items;
  }

  return normalized;
}

function normalizeFields(
  fields: unknown,
  options?: { includeFieldId?: boolean },
) {
  const safeFields = Array.isArray(fields)
    ? (fields as Record<string, unknown>[])
    : [];

  return safeFields.map((field, index) => {
    const name = toText(field.name) || `campo_${index + 1}`;
    const label = toText(field.label) || name;
    const type = toText(field.type) || "text";
    const ordem = toOptionalNumber(field.ordem) ?? index + 1;

    return {
      name,
      type,
      label,
      required: Boolean(field.required),
      ordem,
      options: normalizeOptions(field, options),
    };
  });
}

function normalizeSchema(
  schema: unknown,
  fallbackBlocks?: unknown,
) {
  const safeSchema =
    schema && typeof schema === "object"
      ? ({ ...(schema as Record<string, unknown>) } as Record<string, unknown>)
      : {};

  if (!Array.isArray(safeSchema.blocks) && Array.isArray(fallbackBlocks)) {
    safeSchema.blocks = fallbackBlocks;
  }

  return safeSchema;
}

function normalizeFormPayload(
  payload: Record<string, unknown>,
  projectId?: number,
) {
  const initialVersion =
    (payload.initialVersion as Record<string, unknown> | undefined) ?? {};
  const activeVersion =
    (payload.activeVersion as Record<string, unknown> | undefined) ?? {};

  const schema = normalizeSchema(
    initialVersion.schema ?? payload.schema ?? activeVersion.schema,
    payload.blocks,
  );
  const fields = normalizeFields(
    initialVersion.fields ?? payload.fields ?? activeVersion.fields,
  );

  const name = toText(payload.name) || toText(payload.title);
  if (!name) {
    throw new Error("Nome do formulario e obrigatorio.");
  }

  const normalizedPayload: Record<string, unknown> = {
    name,
    description: toText(payload.description),
    initialVersion: {
      isActive: Boolean(initialVersion.isActive ?? true),
      schema,
      fields,
    },
  };

  if (typeof projectId === "number") {
    normalizedPayload.projetoId = projectId;
  }

  return normalizedPayload;
}

export default function getForms(slug: string, projectName: string) {
  const response = apiPublic.get(
    `/public/projetos/${projectName}/forms/slug/${slug}`,
  );
  return response;
}
export async function getFormsById(id: number) {
  const response = await api.get("/form/list", {
    params: { projetoId: id },
  });

  const payload = response?.data;
  const normalized =
    payload?.data?.forms ??
    payload?.forms ??
    payload?.data ??
    [];

  return Array.isArray(normalized) ? normalized : [];
}


export async function createUSer(user: UserFormValues): Promise<Opinion[]> {
  const response = await apiPublic.post("", {
    action: "create",
    entity: "usuario",
    payload: user,
  });
  const data = response?.data;
  return Array.isArray(data) ? data : []; // garante array mesmo quando a API não retornar lista
}

export async function listForms(slug: string) {
  const hasUsefulEditData = (form: Record<string, unknown>) => {
    const nestedForm =
      (form.form as Record<string, unknown> | undefined) ?? undefined;

    const hasActiveVersion = Boolean(
      form.activeVersion ||
      form.active_version ||
      form.currentVersion ||
      form.latestVersion ||
      nestedForm?.activeVersion ||
      nestedForm?.active_version,
    );

    const hasFieldsInRoot = Array.isArray(form.fields);
    const hasSlug = Boolean(form.slug || form.formSlug || nestedForm?.slug);

    return hasActiveVersion || hasFieldsInRoot || hasSlug;
  };

  try {
    const response = await api.get("/form/list");
    const moduleForms =
      response?.data?.data?.forms ??
      response?.data?.forms ??
      response?.data?.data ??
      [];
    if (
      Array.isArray(moduleForms) &&
      moduleForms.some(
        (form) => form && typeof form === "object" && hasUsefulEditData(form),
      )
    ) {
      return moduleForms;
    }
  } catch {
    // fallback para rota publica enquanto a rota autenticada nao estiver disponivel
  }

  const response = await apiPublic.get(`/public/projetos/${slug}/forms`);
  const publicForms = response?.data?.data?.forms ?? response?.data?.forms;
  return Array.isArray(publicForms) ? publicForms : [];
}

export async function createForm(
  payload: Record<string, unknown>,
  formId?: number | string | null,
) {
  if (formId !== null && formId !== undefined && formId !== "") {
    return updateFormById(formId, payload);
  }

  const projectId = getStoredProjectId();
  if (!projectId) {
    throw new Error("Projeto ativo nao encontrado para criar formulario.");
  }

  return api.post("/form/create", normalizeFormPayload(payload, projectId));
}

export async function updateFormById(
  formId: number | string,
  payload: Record<string, unknown>,
) {
  const name = toText(payload.name) || toText(payload.title);
  if (!name) {
    throw new Error("Nome do formulario e obrigatorio.");
  }

  const projectId = toOptionalId(getStoredProjectId());
  const metadataPayload: Record<string, unknown> = {
    name,
    description: toText(payload.description),
  };

  if (projectId !== null) {
    metadataPayload.projetoId = projectId;
  }

  const formResponse = await api.patch(`/form/update/${formId}`, metadataPayload);

  const versionId =
    toOptionalId(payload.versionId) ??
    toOptionalId(
      (payload.activeVersion as Record<string, unknown> | undefined)?.id,
    );
  const schema = normalizeSchema(payload.schema, payload.blocks);

  if (versionId !== null) {
    await api.patch(`/form-version/update/${versionId}`, { schema });
  } else {
    console.warn(
      "Atualizacao de schema ignorada: formulario sem versao selecionada.",
    );
  }

  const fieldIdByName = Object.entries(
    ((payload.fieldIdByName as Record<string, unknown> | undefined) ?? {}),
  ).reduce<Record<string, number>>((accumulator, [nameKey, idValue]) => {
    const normalizedName = toText(nameKey);
    const normalizedId = toOptionalId(idValue);
    if (normalizedName && normalizedId !== null) {
      accumulator[normalizedName] = normalizedId;
    }
    return accumulator;
  }, {});

  const rawFields = Array.isArray(payload.fields)
    ? (payload.fields as Record<string, unknown>[])
    : [];
  const normalizedFields = normalizeFields(rawFields, { includeFieldId: false });
  const skippedFieldNames: string[] = [];

  for (const [index, field] of normalizedFields.entries()) {
    const rawField = rawFields[index] ?? {};
    const fieldId =
      toOptionalId(rawField.id) ??
      fieldIdByName[field.name] ??
      null;

    if (fieldId === null) {
      skippedFieldNames.push(field.name);
      continue;
    }

    await api.patch(`/form-field/update/${fieldId}`, {
      ordem: field.ordem,
      options: field.options,
    });
  }

  if (skippedFieldNames.length) {
    console.warn(
      `Campos sem fieldId no update (ignorados): ${skippedFieldNames.join(", ")}`,
    );
  }

  return formResponse;
}
