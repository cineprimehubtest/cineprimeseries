import React from "react";
import Link from "next/link";
import { Tv, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="py-24 flex flex-col items-center justify-center text-center space-y-5">
      <div className="w-20 h-20 rounded-3xl bg-primary/20 text-primary-light flex items-center justify-center shadow-glow-violet">
        <Tv size={36} />
      </div>

      <div className="space-y-2 max-w-md">
        <span className="text-xs font-bold text-accent-light uppercase tracking-widest">
          404 — Episode / Series Not Found
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          Signal Lost in Transmission
        </h1>
        <p className="text-sm text-slate-400">
          The TV series or episode you are searching for might have ended, moved to another season, or is not in our database.
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <Link href="/">
          <Button variant="primary" icon={<Home size={16} />}>
            Back to Home
          </Button>
        </Link>
        <Link href="/search">
          <Button variant="glass" icon={<Search size={16} />}>
            Search Series
          </Button>
        </Link>
      </div>
    </div>
  );
}
