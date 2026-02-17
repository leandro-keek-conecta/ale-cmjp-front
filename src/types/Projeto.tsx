export interface ProjectUserDTO {
  userId: number;
  projetoId: number;
  assignedAt: string;
  user: {
    id: number;
    name: string;
    email: string;
    password: string;
    profession: string | null;
    role: string;
    createdAt: string;
    updatedAt: string;
  };
}


export interface ProjectDTO {
  id: number;
  name: string;
  logoUrl?: string | null;
  corHex?: string | null;
  createdAt?: string;
  updatedAt?: string;
  users?: ProjectUserDTO[];
}
