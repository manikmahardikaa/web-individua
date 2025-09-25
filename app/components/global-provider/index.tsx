"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SessionProvider } from "next-auth/react";

export default function GlobalProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const queryClient = new QueryClient();
  return (
    <SessionProvider>
      <AntdRegistry>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </AntdRegistry>
    </SessionProvider>
  );
}
