import type { ProjetoAccessLevel } from "./IUserType";

export interface UpdateUserDTO {
  id?: number;
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  profession?: string;
  projetos?: {
    id: number;
    access: ProjetoAccessLevel;
    hiddenTabs?: string[];
    allowedThemes?: string[];
  }[];
}
