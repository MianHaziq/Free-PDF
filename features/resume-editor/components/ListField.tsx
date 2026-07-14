"use client"; // local draft text, committed as a parsed string[] to the store on blur

import { useState } from "react";

import { FormField } from "@/components/ui/FormField";
import { Textarea } from "@/components/ui/textarea";

interface ListFieldProps {
  id: string;
  label: string;
  values: string[];
  onCommit: (values: string[]) => void;
  /** Defaults to newline (one item per line, e.g. bullets). Use "," for a comma-separated list (e.g. technologies). */
  delimiter?: string;
  rows?: number;
}

function valuesToText(values: string[], delimiter: string): string {
  return values.join(delimiter === "," ? ", " : delimiter);
}

function textToValues(text: string, delimiter: string): string[] {
  return text
    .split(delimiter)
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * A textarea backed by local draft state, only committing the parsed list
 * to the store on blur. A fully store-controlled textarea would re-render
 * with the *filtered* value on every keystroke, silently discarding
 * newly-typed blank lines (e.g. the moment a user presses Enter to start a
 * new bullet) — this avoids that.
 *
 * No effect is needed to re-sync `values` from outside: the parent entry
 * this is nested in always gets a fresh id on import/reset (see
 * blankResume.ts), so its `key` in the parent's `.map()` already forces a
 * full remount (and fresh initial state here) whenever a new resume loads.
 */
export function ListField({ id, label, values, onCommit, delimiter = "\n", rows = 4 }: ListFieldProps) {
  const [text, setText] = useState(() => valuesToText(values, delimiter));

  return (
    <FormField id={id} label={label}>
      <Textarea
        id={id}
        rows={rows}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => onCommit(textToValues(text, delimiter))}
      />
    </FormField>
  );
}
