export interface Block {
  type: "text" | "image" | "heading" | "quote" | "list";
  value: string;
  order: number;
  caption?: string;
  level?: 2 | 3 | 4; // for headings
}

type Comment = {
  _id: string;

  text: string;

  parent_id: string | null;

  user_id: {
    first_name: string;
  };
};

export interface Blog {
  _id: string;
  title: string;
  thumbnail: string;
  excerpt: string;
  tags: string[];
  status: string;
  published_at: string;
  views_count: number;
  likes_count: number;
  has_liked: boolean;
  content_blocks: Block[];
  author?: {
    name: string;
    avatar: string;
    bio: string;
  };
  category?: string;
  read_time?: number;
  seo_title?: string;
  seo_description?: string;
}

export interface RelatedPost {
  _id: string;
  title: string;
  slug: string;
  thumbnail: string;
  excerpt: string;
  published_at: string;
}
