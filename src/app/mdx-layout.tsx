export default function MdxLayout({ children }: { children: React.ReactNode }) {
  return (
    <article
      className="prose prose-invert max-w-none -mt-2
      prose-p:text-shade-secondary
      prose-headings:text-shade-primary
      prose-headings:font-semibold
      prose-strong:text-shade-primary prose-strong:font-medium
      prose-ul:pl-6 prose-ul:pb-3
      prose-ol:pl-6 prose-ol:pb-3
      prose-li:m-0 prose-li:relative
      prose-headings:py-2
      prose-h1:tracking-[-0.025em]
      prose-p:empty:hidden
      md:prose-h1:text-[32px]
      md:prose-h2:text-[28px]
      md:prose-h3:text-[24px]
      md:prose-h4:text-[20px]
      sm:prose-h1:text-[28px]
      sm:prose-h2:text-[24px]
      sm:prose-h3:text-[20px]
      sm:prose-h4:text-base
      prose-blockquote:text-brand-secondary
      prose-blockquote:pr-4
      prose-blockquote:[font-style:normal]
      prose-blockquote:border-l-2
      prose-figure:my-0
      prose-code:[font-family:var(--font-fira-code)]
      prose-code:font-medium
      prose-code:text-brand-secondary
      prose-code:before:hidden
      prose-code:after:hidden
      prose-headings:font-sans
      prose-p:font-content
      prose-li:font-content
      prose-ol:font-content
      prose-ul:font-content
      prose-blockquote:font-content
      prose-pre:font-content
      prose-a:font-content
      prose-li:text-shade-primary
      prose-li:mb-2
      prose-pre:bg-card-solid prose-code:px-2 prose-code:py-1"
    >
      {children}
    </article>
  );
}
