import { MetadataRoute } from "next";
import { getAllSeries } from "@/lib/seriesService";
import { MAIN_CATEGORIES } from "@/lib/matching";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://cineprimeseries.vercel.app";
  const allSeries = await getAllSeries();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/trending`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/new`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/top-rated`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/latest-episodes`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/language/tamil`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = MAIN_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const seriesRoutes: MetadataRoute.Sitemap = allSeries.map((s) => ({
    url: `${baseUrl}/series/${s.slug}`,
    lastModified: s.updatedAt ? new Date(s.updatedAt) : new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...seriesRoutes];
}
