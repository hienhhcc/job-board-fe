import { markdownClassNames } from "@/components/markdown/_MarkdownEditor";
import { cn } from "@/lib/utils";
import { MDXRemote, MDXRemoteProps } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export default function MarkdownRenderer({
  className,
  options,
  ...props
}: MDXRemoteProps & { className?: string }) {
  return (
    <div className={cn(markdownClassNames, className)}>
      <MDXRemote
        {...props}
        options={{
          mdxOptions: {
            remarkPlugins: [
              remarkGfm,
              ...(options?.mdxOptions?.remarkPlugins ?? []),
            ],
            ...options?.mdxOptions,
          },
        }}
      />
    </div>
  );
}
