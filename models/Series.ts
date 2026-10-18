import { Series } from "@/types";

export interface SeriesDocument extends Series {
  _id?: string;
}

export const SERIES_COLLECTION = "series";
