import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getIcon } from "@/utils";
import { logger } from "@/utils/core/common/logger";

interface DevArticle {
  id: number;
  title: string;
  description: string;
  url: string;
  cover_image: string;
  reading_time_minutes: number;
  tag_list: string[];
}

const safeUrl = (url: string) => {
  if (url.startsWith("https://") || url.startsWith("http://")) return url;
  return "#";
};

const fetchArticles = async (): Promise<DevArticle[]> => {
  // In development, this might 404 if the Go server isn't running on the same port/proxy
  // For now, we assume the proxy is correctly routed or mapped.
  const res = await fetch("/api/marketing/blog");
  if (!res.ok) throw new Error("Failed to fetch articles");
  return res.json();
};

const BlogCardSkeleton = () => (
  <div className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden animate-pulse">
    <div className="h-48 bg-slate-800" />
    <div className="p-6 space-y-4">
      <div className="h-6 bg-slate-800 rounded w-3/4" />
      <div className="h-4 bg-slate-800 rounded w-full" />
      <div className="h-4 bg-slate-800 rounded w-1/2" />
    </div>
  </div>
);

export const DevBlogGrid: React.FC = () => {
  const {
    data: articles,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["dev-to-articles"],
    queryFn: fetchArticles,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  React.useEffect(() => {
    if (error) {
      logger.error("Failed to fetch blog articles", { error });
    }
  }, [error]);

  return (
    <div className="py-24 px-4 bg-slate-950 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-50 mb-2">
              BUILDING IN <span className="text-fuchsia-500">PUBLIC</span>
            </h2>
            <p className="text-purple-900 max-w-xl">
              Follow the journey of building an open-source, local-first financial engine. Technical
              deep dives, architectural decisions, and lessons learned.
            </p>
          </div>
          <a
            href="https://dev.to/thef4tdaddy"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-fuchsia-400 font-bold hover:text-fuchsia-300 transition-colors"
          >
            <span>VIEW ALL ON DEV.TO</span>
            {React.createElement(getIcon("ArrowRight"), { className: "w-5 h-5" })}
          </a>
        </div>

        {error ? (
          <div className="p-8 rounded-xl border border-red-500/30 bg-red-900/10 text-center">
            <h3 className="text-xl font-bold text-red-400 mb-2">Unable to load feed</h3>
            <p className="text-slate-400">System functionality is unaffected.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading
              ? Array.from({ length: 3 }).map((_, i) => <BlogCardSkeleton key={i} />)
              : articles?.slice(0, 3).map((article) => (
                  <a
                    key={article.id}
                    href={safeUrl(article.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block rounded-xl border border-white/20 ring-1 ring-gray-800/10 bg-slate-900/40 hover:border-fuchsia-500/50 hover:bg-slate-900/80 transition-all duration-300 overflow-hidden"
                  >
                    <div className="relative h-48 overflow-hidden">
                      {article.cover_image ? (
                        <img
                          src={article.cover_image}
                          alt={article.title}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                          {React.createElement(getIcon("FileText"), {
                            className: "w-12 h-12 text-slate-700",
                          })}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-3 py-1 bg-black/70 backdrop-blur-sm rounded-full text-xs font-bold text-slate-300">
                        {article.reading_time_minutes} MIN READ
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {article.tag_list.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="text-xs font-mono font-bold text-fuchsia-500/80"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-xl font-bold text-slate-100 mb-2 group-hover:text-fuchsia-400 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-2">{article.description}</p>
                    </div>
                  </a>
                ))}
          </div>
        )}
      </div>
    </div>
  );
};
