"use client";

import { Suspense, lazy } from "react";

const LazyVideoInformationContent = lazy(() => import("./content"));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyVideoInformationContent />
    </Suspense>
  );
}
