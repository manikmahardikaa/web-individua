"use client";

import { Suspense, lazy } from "react";

const LazyHistoryDetail = lazy(() => import("./content"));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyHistoryDetail />
    </Suspense>
  );
}
