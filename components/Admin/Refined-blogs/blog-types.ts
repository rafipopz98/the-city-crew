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
  mode?: "create" | "edit";
  initialData?: BlogFormState | null;
}

export interface BlogFormState {
  _id?: string;
  title: string;
  thumbnail: string;
  excerpt: string;
  tags: string[];
  status: "draft" | "published" | "hidden";
  is_featured: boolean;
  content_blocks: Block[];
}

export const STEPS = ["Basics", "Story", "Publish"] as const;
export type StepId = (typeof STEPS)[number];
