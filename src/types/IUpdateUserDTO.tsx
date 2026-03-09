export interface UpdateUserDTO {
  id?: number;
  email?: string;
  password?: string;
  name?: string;
  role?: string;
  projetos?: {
    id: number;
    hiddenTabs?: string[];
    temasPermitidos?: string[];
  }[];
}
