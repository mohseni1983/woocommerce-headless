import { Metadata } from "next";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "product";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords,
    image = "/og-image.jpg",
    url = "https://30tel.com",
    type = "website",
    noindex = false,
    nofollow = false,
  } = config;

  const fullTitle = `${title} | 30tel - فروشگاه موبایل و گجت`;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || url;

  return {
    title: fullTitle,
    description,
    keywords: keywords || "موبایل, گجت, آیفون, سامسونگ, فروشگاه آنلاین",
    authors: [{ name: "30tel" }],
    creator: "30tel",
    publisher: "30tel",
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      type: type === "product" ? "website" : type,
      locale: "fa_IR",
      url: siteUrl,
      siteName: "30tel",
      title: fullTitle,
      description,
      images: [
        {
          url: image.startsWith("http") ? image : `${siteUrl}${image}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image.startsWith("http") ? image : `${siteUrl}${image}`],
    },
    alternates: {
      canonical: siteUrl,
    },
    metadataBase: new URL(siteUrl),
  };
}

export function generateProductStructuredData(product: {
  name: string;
  description: string;
  image: string;
  price: string;
  currency?: string;
  availability?: string;
  sku?: string;
  brand?: string;
  rating?: {
    value: number;
    count: number;
  };
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://30tel.com";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image.startsWith("http") ? product.image : `${siteUrl}${product.image}`,
    brand: {
      "@type": "Brand",
      name: product.brand || "30tel",
    },
    offers: {
      "@type": "Offer",
      url: siteUrl,
      priceCurrency: product.currency || "IRR",
      price: product.price,
      availability: product.availability || "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.sku && { sku: product.sku }),
    ...(product.rating && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: product.rating.value,
        reviewCount: product.rating.count,
      },
    }),
  };
}

export function generateOrganizationStructuredData() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://30tel.com";

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "30tel",
    url: siteUrl,
    logo: `${siteUrl}/logo.png`,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+98-21-12345678",
      contactType: "customer service",
      areaServed: "IR",
      availableLanguage: "fa",
    },
    sameAs: [
      "https://instagram.com/30tel",
      "https://twitter.com/30tel",
      "https://facebook.com/30tel",
    ],
  };
}

export function generateBreadcrumbStructuredData(items: Array<{ name: string; url: string }>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://30tel.com";

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${siteUrl}${item.url}`,
    })),
  };
}

