import type { ContactInfo } from "@/types/resume";

/** Joins the non-null contact fields (email/phone/location/links) into one "a | b | c" line, omitting fullName (shown separately as the document heading). */
export function buildContactLine(contact: ContactInfo): string {
  return [
    contact.email,
    contact.phone,
    contact.location,
    contact.linkedin,
    contact.github,
    contact.website,
  ]
    .filter((value): value is string => Boolean(value))
    .join(" | ");
}
