"use client";

import { Suspense, lazy } from "react";

const LazyNewsContent = lazy(() => import("./content"));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyNewsContent />
    </Suspense>
  );
}
