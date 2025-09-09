import { ReactNode, Suspense } from "react";

type AsyncIfProps = {
  children: ReactNode;
  loadingFallback?: ReactNode;
  otherwise?: ReactNode;
  condition: () => Promise<boolean>;
};

export function AsyncIf({
  children,
  loadingFallback,
  otherwise,
  condition,
}: AsyncIfProps) {
  return (
    <Suspense fallback={loadingFallback}>
      <SuspendedComponent condition={condition} otherwise={otherwise}>
        {children}
      </SuspendedComponent>
    </Suspense>
  );
}

async function SuspendedComponent({
  children,
  condition,
  otherwise,
}: Omit<AsyncIfProps, "loadingFallback">) {
  return (await condition()) ? children : otherwise;
}
