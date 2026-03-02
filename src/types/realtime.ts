export type DomainChangedEvent = {
  action: "created" | "updated" | "deleted";
  entity: "form" | "formVersion" | "formField" | "formResponse";
  entityId: number;
  projetoId?: number;
  formId?: number;
  formVersionId?: number;
  occurredAt: string;
};

export type RealtimeScope = {
  projetoId?: number | null;
  formId?: number | null;
  formVersionId?: number | null;
};

export type RealtimeScopePayload = {
  projetoId?: number;
  formId?: number;
  formVersionId?: number;
};

export function toRealtimeScopePayload(
  scope: RealtimeScope,
): RealtimeScopePayload | null {
  const payload: RealtimeScopePayload = {};

  if (typeof scope.projetoId === "number") {
    payload.projetoId = scope.projetoId;
  }
  if (typeof scope.formId === "number") {
    payload.formId = scope.formId;
  }
  if (typeof scope.formVersionId === "number") {
    payload.formVersionId = scope.formVersionId;
  }

  return Object.keys(payload).length ? payload : null;
}

export function matchesRealtimeScope(
  event: DomainChangedEvent,
  scope: RealtimeScopePayload,
) {
  if (
    typeof scope.projetoId === "number" &&
    event.projetoId !== scope.projetoId
  ) {
    return false;
  }

  if (typeof scope.formId === "number" && event.formId !== scope.formId) {
    return false;
  }

  if (
    typeof scope.formVersionId === "number" &&
    event.formVersionId !== scope.formVersionId
  ) {
    return false;
  }

  return true;
}
