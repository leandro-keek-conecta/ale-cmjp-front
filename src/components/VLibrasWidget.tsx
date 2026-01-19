import { useEffect } from "react";

declare global {
  interface Window {
    VLibras?: {
      Widget: new (url: string) => unknown;
    };
    __vlibrasWidget?: unknown;
  }
}

const VLibrasWidget = () => {
  useEffect(() => {
    const containerId = "vlibras-plugin-container";

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
  }, []);

  return null;
};

export default VLibrasWidget;
