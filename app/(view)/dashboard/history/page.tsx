"use client";

import { Suspense, lazy } from "react";

const LazyHistoryContent = lazy(() => import("./content"));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyHistoryContent />
    </Suspense>
  );
}
