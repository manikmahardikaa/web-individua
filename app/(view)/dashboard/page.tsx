"use client";

import Loading from "@/app/components/common/loading";
import React from "react";
import { Suspense, lazy } from "react";

const DashboardComponent = lazy(() => import("./content"));

export default function Dashboard() {
  return (
    <Suspense fallback={<Loading />}>
      <DashboardComponent />
    </Suspense>
  );
}
