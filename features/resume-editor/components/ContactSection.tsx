"use client"; // needs react-hook-form state + a live subscription to push edits into the store

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/ui/FormField";
import { Input } from "@/components/ui/input";
import {
  contactFormSchema,
  contactToFormValues,
  type ContactFormValues,
} from "@/features/resume-editor/formSchemas";
import { useResumeEditorStore } from "@/features/resume-editor/store";

export function ContactSection() {
  const contact = useResumeEditorStore((state) => state.contact);
  const resumeId = useResumeEditorStore((state) => state.id);
  const setContact = useResumeEditorStore((state) => state.setContact);

  const {
    register,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: contactToFormValues(contact),
    mode: "onBlur",
  });

  // Re-sync the form when a whole new resume is loaded (import/reset), not
  // on every keystroke — resumeId only changes on those bulk actions.
  const previousResumeId = useRef(resumeId);
  useEffect(() => {
    if (previousResumeId.current !== resumeId) {
      previousResumeId.current = resumeId;
      reset(contactToFormValues(useResumeEditorStore.getState().contact));
    }
  }, [resumeId, reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      setContact({
        fullName: value.fullName ?? "",
        email: value.email || null,
        phone: value.phone || null,
        location: value.location || null,
        linkedin: value.linkedin || null,
        github: value.github || null,
        website: value.website || null,
      });
    });
    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <FormField id="fullName" label="Full name" error={errors.fullName?.message}>
          <Input id="fullName" {...register("fullName")} />
        </FormField>
        <FormField id="email" label="Email" error={errors.email?.message}>
          <Input id="email" type="email" {...register("email")} />
        </FormField>
        <FormField id="phone" label="Phone" error={errors.phone?.message}>
          <Input id="phone" {...register("phone")} />
        </FormField>
        <FormField id="location" label="Location" error={errors.location?.message}>
          <Input id="location" {...register("location")} />
        </FormField>
        <FormField id="linkedin" label="LinkedIn" error={errors.linkedin?.message}>
          <Input id="linkedin" {...register("linkedin")} />
        </FormField>
        <FormField id="github" label="GitHub" error={errors.github?.message}>
          <Input id="github" {...register("github")} />
        </FormField>
        <FormField id="website" label="Website" error={errors.website?.message}>
          <Input id="website" {...register("website")} />
        </FormField>
      </CardContent>
    </Card>
  );
}
