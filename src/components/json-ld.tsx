/**
 * Renders JSON-LD structured data.
 *
 * Values come from our own content datasets, never from user input, so the
 * only escaping needed is for `<` — which would otherwise let a stray value
 * close the script tag early.
 */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const blocks = Array.isArray(data) ? data.filter(Boolean) : [data];

  return (
    <>
      {blocks.map((block, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(block).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
