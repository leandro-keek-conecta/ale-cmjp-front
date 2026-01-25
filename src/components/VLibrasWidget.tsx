import { useEffect } from "react";
import { useLocation } from "react-router-dom";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => unknown;
    };
    __vlibrasWidget?: unknown;
  }
}

type VLibrasWidgetProps = {
  disabled?: boolean;
  disabledOnPaths?: string[];
};

const VLibrasWidget = ({
  disabled = false,
  disabledOnPaths = [],
}: VLibrasWidgetProps) => {
  const location = useLocation();
  const isDisabled =
    disabled ||
    disabledOnPaths.some(
      (path) =>
        location.pathname === path ||
        location.pathname.startsWith(`${path}/`)
    );

  useEffect(() => {
    const containerId = "vlibras-plugin-container";

    if (isDisabled) {
      document.getElementById(containerId)?.remove();
      if (window.__vlibrasWidget) {
        window.__vlibrasWidget = undefined;
      }
      return;
    }

    const ensureMarkup = () => {
      const existing = document.getElementById(containerId);
      if (existing) return existing;

      const wrapper = document.createElement("div");
      wrapper.id = containerId;
      wrapper.setAttribute("vw", "");
      wrapper.className = "enabled";
      wrapper.innerHTML = `
        <div vw-access-button class="active"></div>
        <div vw-plugin-wrapper>
          <div class="vw-plugin-top-wrapper"></div>
        </div>
      `;
      document.body.appendChild(wrapper);
      return wrapper;
    };

    const initVLibras = () => {
      ensureMarkup();
      if (window.__vlibrasWidget || !window.VLibras?.Widget) return;
      window.__vlibrasWidget = new window.VLibras.Widget(
        "https://vlibras.gov.br/app"
      );
    };

    ensureMarkup();

    const scriptId = "vlibras-plugin-script";
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    const handleLoad = () => initVLibras();

    if (script) {
      if (window.VLibras?.Widget) {
        initVLibras();
      } else {
        script.addEventListener("load", handleLoad);
      }
    } else {
      script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
      script.async = true;
      script.addEventListener("load", handleLoad);
      script.addEventListener("error", () =>
        console.error("Não foi possível carregar o VLibras.")
      );
      document.body.appendChild(script);
    }

    return () => {
      script?.removeEventListener("load", handleLoad);
    };
  }, [isDisabled]);

  return null;
};

export default VLibrasWidget;
