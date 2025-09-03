export default function ClerkLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex w-screen h-screen justify-center items-center">
      <div>{children}</div>
    </div>
  );
}
