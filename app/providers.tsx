"use client";

import type { ReactNode } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { authClient } from "@/lib/auth-client";

// Create a Link adapter that matches the expected type
const LinkAdapter = ({ href, className, children }: {
  href: string;
  className?: string;
  children: ReactNode
}) => {
  return (
    <NextLink href={href} className={className}>
      {children}
    </NextLink>
  );
};

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();

  return (
    <AuthUIProvider
      authClient={authClient}
      navigate={router.push}
      replace={router.replace}
      onSessionChange={() => {
        router.refresh();
      }}
      Link={LinkAdapter as any}
    >
      {children}
    </AuthUIProvider>
  );
}
