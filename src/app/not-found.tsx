import { Button, Grain } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="relative overflow-hidden bg-ink-deep text-paper">
      <Grain />
      <div className="container-page relative flex min-h-[80vh] flex-col justify-center py-[calc(var(--header-height)+4rem)]">
        <p className="label flex items-center gap-3 text-paper/45">
          <span className="h-px w-8 bg-accent" />
          Error 404
        </p>
        <h1 className="mt-8 max-w-[14ch] font-display text-5xl text-paper">
          We couldn&rsquo;t find that page.
        </h1>
        <p className="mt-8 max-w-md text-lg leading-relaxed text-paper/65">
          The link may be out of date, or the page may have moved when we
          rebuilt the site. Here are a few good places to start.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/" tone="paper">
            Home
          </Button>
          <Button href="/sermons" tone="outlineLight">
            Sermons
          </Button>
          <Button href="/contact" tone="outlineLight">
            Contact us
          </Button>
        </div>
      </div>
    </div>
  );
}
