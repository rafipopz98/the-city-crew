export type BlockType = "text" | "image";

export interface Block {
  type: BlockType;
  value: string;
  order: number;
}

export interface CreateBlogModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export interface BlogFormState {
  title: string;
  thumbnail: string;
  excerpt: string;
  tags: string[];
  status: "draft" | "published" | "hidden";
  isFeatured: boolean;
  blocks: Block[];
}

export const STEPS = ["Basics", "Story", "Publish"] as const;
export type StepId = (typeof STEPS)[number];
