"use client";

import { Suspense, lazy } from "react";

const LazyQuestionContent = lazy(() => import("./content"));

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyQuestionContent />
    </Suspense>
  );
}
