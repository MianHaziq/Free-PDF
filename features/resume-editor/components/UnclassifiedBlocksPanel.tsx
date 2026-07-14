"use client"; // reads/writes the store's unclassifiedBlocks array

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useResumeEditorStore } from "@/features/resume-editor/store";

/**
 * Surfaces text the parser couldn't confidently classify (see
 * docs/PARSING_STRATEGY.md: "surfaced to the user rather than dropped or
 * guessed"). Read-only raw text — the user re-creates the correct
 * structured entry in the relevant section above and discards this.
 */
export function UnclassifiedBlocksPanel() {
  const unclassifiedBlocks = useResumeEditorStore((state) => state.unclassifiedBlocks);
  const dismissUnclassifiedBlock = useResumeEditorStore(
    (state) => state.dismissUnclassifiedBlock,
  );

  if (unclassifiedBlocks.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Needs review</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm text-muted-foreground">
          The parser couldn&apos;t confidently place this text into a section.
          Copy anything useful into the right section above, then discard it.
        </p>
        {unclassifiedBlocks.map((block, index) => (
          <div
            key={`${index}-${block.rawText.slice(0, 20)}`}
            className="flex flex-col gap-2 rounded-lg border border-input p-3"
          >
            {block.suggestedSection ? (
              <p className="text-xs font-medium uppercase text-muted-foreground">
                Suggested section: {block.suggestedSection}
              </p>
            ) : null}
            <pre className="whitespace-pre-wrap font-sans text-sm">{block.rawText}</pre>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="self-start"
              onClick={() => dismissUnclassifiedBlock(index)}
            >
              Discard
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
