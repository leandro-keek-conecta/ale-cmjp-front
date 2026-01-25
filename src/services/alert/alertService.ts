type AlertOptions = {
  category?: "error" | "info" | "warning" | "success";
  title: string;
};

type AlertHandler = (options: AlertOptions) => void;

let handler: AlertHandler | null = null;

export function registerAlert(newHandler: AlertHandler) {
  handler = newHandler;
}

export function showGlobalAlert(options: AlertOptions) {
  handler?.(options);
}
