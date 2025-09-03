import { ReactNode, Suspense } from "react";
import {
  SignedIn as ClerkSignedIn,
  SignedOut as ClerkSignedOut,
} from "@clerk/nextjs";

function SignedIn({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ClerkSignedIn>{children}</ClerkSignedIn>
    </Suspense>
  );
}

function SignedOut({ children }: { children: ReactNode }) {
  return (
    <Suspense>
      <ClerkSignedOut>{children}</ClerkSignedOut>
    </Suspense>
  );
}

export { SignedIn, SignedOut };
