"use client";

import { type FC } from "react";

const SPINNER_CLASSES =
  "flex justify-center items-center h-[70vh]";

/**
 * Default loading spinner shown by ContentLoader when no customLoader is provided.
 * Kept in a separate component so it can be memoized and avoid unnecessary re-renders.
 */
export const DefaultSpinner: FC = () => (
  <div className={SPINNER_CLASSES} role="status" aria-label="Loading">
    <span className="relative flex h-5 w-5">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-200 opacity-50" />
      <span className="relative inline-flex h-5 w-5 rounded-full bg-blue-300" />
    </span>
  </div>
);