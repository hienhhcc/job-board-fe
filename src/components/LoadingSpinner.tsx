import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import { ComponentProps } from "react";

export default function LoadingSpinner({
  className,
  ...props
}: ComponentProps<typeof Loader2Icon>) {
  return (
    <div className="w-full h-full flex items-cetner justify-center">
      <Loader2Icon
        className={cn("animate-spin size-16", className)}
        {...props}
      />
    </div>
  );
}
