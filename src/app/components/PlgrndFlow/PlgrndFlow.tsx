const PLGRND_EMBED_URL = "https://plgrnd.io/embed";

export interface PlgrndFlowProps {
  src: string;
  title?: string;
}

export const PlgrndFlow = ({ src, title = "Interactive PLGRND flow" }: PlgrndFlowProps) => {
  if (!src.startsWith(`${PLGRND_EMBED_URL}?`) && !src.startsWith(`${PLGRND_EMBED_URL}#`)) {
    return null;
  }

  return (
    <div className="mx-auto w-full border border-border bg-card-solid">
      <iframe
        src={src}
        title={title}
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        allow="clipboard-write"
        className="aspect-video w-full border-0"
      />
    </div>
  );
};
