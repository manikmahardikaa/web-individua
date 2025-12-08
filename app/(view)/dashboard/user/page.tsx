"use client";

import { Suspense, lazy } from "react";

const LazyUserContent = lazy(() => import("./content"));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyUserContent />
    </Suspense>
  );
}
