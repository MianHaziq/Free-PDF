import { z } from "zod";

/**
 * Native text inputs can only ever emit "" (never null), but ContactInfo
 * (docs/DATA_MODEL.md) uses null for "no value" on optional fields. This
 * is the form-values shape (all plain strings) used by react-hook-form;
 * ContactSection converts "" <-> null at the store boundary. Keeping this
 * separate from contactInfoSchema (lib/validation) avoids a
 * `z.preprocess` whose `unknown` input type doesn't match a typed
 * `useForm<ContactInfo>` resolver.
 */
export const contactFormSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: z.union([z.literal(""), z.email("Invalid email")]),
  phone: z.string(),
  location: z.string(),
  linkedin: z.string(),
  github: z.string(),
  website: z.string(),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;

export function contactToFormValues(contact: {
  fullName: string;
  email: string | null;
  phone: string | null;
  location: string | null;
  linkedin: string | null;
  github: string | null;
  website: string | null;
}): ContactFormValues {
  return {
    fullName: contact.fullName,
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    location: contact.location ?? "",
    linkedin: contact.linkedin ?? "",
    github: contact.github ?? "",
    website: contact.website ?? "",
  };
}
