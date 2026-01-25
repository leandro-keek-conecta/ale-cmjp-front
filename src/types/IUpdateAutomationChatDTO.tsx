export interface UpdateAutomationChatDTO {
  id: number;
  slug: string;
  title: string;
  description: string;
  url: string;
  isActive: boolean;
  projetoId: number;
}
