// services/alertService.ts
let showAlert: ((args: { category?: "error" | "info" | "warning" | "success"; title: string }) => void) | null = null;

export const registerAlert = (fn: typeof showAlert) => {
  showAlert = fn;
};

export const triggerAlert = (args: { category?: "error" | "info" | "warning" | "success"; title: string }) => {
  if (showAlert) showAlert(args);
};
