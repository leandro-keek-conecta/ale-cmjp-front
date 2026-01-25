import type Projeto from "./IProjetoType";

export interface AutomationChatProjectPivot {
  id?: number;
  projetoId: number;
  automationChatId: number;
  projeto?: Projeto;
}

export default interface AutomationChat {
  id: number;
  slug: string;
  title: string;
  description: string;
  url: string;
  isActive: boolean;
  projetoId?: number;
  projeto?: Projeto;
  projetos?: AutomationChatProjectPivot[];
  createdAt?: string;
  updatedAt?: string;
}
