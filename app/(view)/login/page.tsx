"use client";

import Loading from "@/app/components/common/loading";
import { Suspense, lazy } from "react";

const LoginContent = lazy(() => import("./content"));

export default function Login() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginContent />
    </Suspense>
  );
}
