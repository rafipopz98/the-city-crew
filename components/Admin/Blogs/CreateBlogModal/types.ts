export type Block = {
  type: "text" | "image";
  value: string;
  order: number;
};

export type CreateBlogModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};
