import type { PanoramaResponse } from "./panoramaResponse";

export type Opinion = PanoramaResponse & {
  bairros?: string;
  tipo_de_opiniao?: string
};
