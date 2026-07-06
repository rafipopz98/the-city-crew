import { Metadata } from "next";
import { SITE_CONFIG } from "./site";

type SEOProps = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  noIndex?: boolean;
};

export function createMetadata({
  title,
  description,
  path = "",
  image = "/og/default.png",
  keywords = [],
  noIndex = false,
}: SEOProps): Metadata {
  const url = `${SITE_CONFIG.url}${path}`;

  return {
    title,
    description,
    keywords,

    alternates: {
      canonical: url,
    },

    openGraph: {
      title,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: "website",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      creator: SITE_CONFIG.twitter,
      title,
      description,
      images: [image],
    },

    robots: {
      index: !noIndex,
      follow: !noIndex,
    },
  };
}
