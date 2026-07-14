/**
 * Cross-cutting primitive types shared by every domain entity.
 * See docs/DATA_MODEL.md for the entities that consume these.
 */

/** Parser/extraction confidence level (see docs/PARSING_STRATEGY.md). */
export type Confidence = "high" | "medium" | "low";

/** "YYYY-MM" or "YYYY-MM-DD". Validated at runtime via lib/validation. */
export type ISODateString = string;

/** UUID v4 string. Validated at runtime via lib/validation. */
export type UUID = string;
