import { useEffect, useRef } from "react";
import { socket } from "@/lib/socket";
import {
  matchesRealtimeScope,
  toRealtimeScopePayload,
  type DomainChangedEvent,
  type RealtimeScope,
} from "@/types/realtime";

type UseRealtimeSubscriptionArgs = {
  scope: RealtimeScope;
  enabled?: boolean;
  debounceMs?: number;
  entities?: DomainChangedEvent["entity"][];
  onChange: (event: DomainChangedEvent) => void;
};

export function useRealtimeSubscription({
  scope,
  enabled = true,
  debounceMs = 0,
  entities,
  onChange,
}: UseRealtimeSubscriptionArgs) {
  const onChangeRef = useRef(onChange);
  const debounceRef = useRef<number | null>(null);
  const entitiesKey = entities?.join("|") ?? "";

  onChangeRef.current = onChange;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const payload = toRealtimeScopePayload(scope);
    if (!payload) {
      return;
    }

    socket.emit("subscribe", payload);

    const handleChange = (event: DomainChangedEvent) => {
      if (!matchesRealtimeScope(event, payload)) {
        return;
      }

      if (entities?.length && !entities.includes(event.entity)) {
        return;
      }

      if (debounceMs > 0) {
        if (debounceRef.current !== null) {
          window.clearTimeout(debounceRef.current);
        }

        debounceRef.current = window.setTimeout(() => {
          onChangeRef.current(event);
        }, debounceMs);
        return;
      }

      onChangeRef.current(event);
    };

    socket.on("domain:changed", handleChange);

    return () => {
      socket.off("domain:changed", handleChange);
      socket.emit("unsubscribe", payload);

      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [
    debounceMs,
    enabled,
    entitiesKey,
    scope.formId,
    scope.formVersionId,
    scope.projetoId,
  ]);
}

type UseProjectRealtimeArgs = Omit<UseRealtimeSubscriptionArgs, "scope"> & {
  projetoId: number | null | undefined;
};

export function useProjectRealtime({
  projetoId,
  ...options
}: UseProjectRealtimeArgs) {
  useRealtimeSubscription({
    ...options,
    enabled: options.enabled ?? typeof projetoId === "number",
    scope: { projetoId },
  });
}

type UseFormRealtimeArgs = Omit<UseRealtimeSubscriptionArgs, "scope"> & {
  formId: number | null | undefined;
};

export function useFormRealtime({ formId, ...options }: UseFormRealtimeArgs) {
  useRealtimeSubscription({
    ...options,
    enabled: options.enabled ?? typeof formId === "number",
    scope: { formId },
  });
}

type UseFormVersionRealtimeArgs = Omit<
  UseRealtimeSubscriptionArgs,
  "scope"
> & {
  formVersionId: number | null | undefined;
};

export function useFormVersionRealtime({
  formVersionId,
  ...options
}: UseFormVersionRealtimeArgs) {
  useRealtimeSubscription({
    ...options,
    enabled: options.enabled ?? typeof formVersionId === "number",
    scope: { formVersionId },
  });
}
