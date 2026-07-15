import { buildContactLine } from "@/features/resume-preview/buildContactLine";
import { formatDateRange } from "@/features/resume-preview/dateFormatting";
import type { PreviewResumeData } from "@/features/resume-preview/types";

interface TemplateProps {
  data: PreviewResumeData;
}

/**
 * A second, visually distinct layout (left-aligned header, accent-colored
 * section labels, no rule lines) while staying just as ATS-friendly as
 * ClassicTemplate: still single-column plain text, no graphics/tables.
 */
export function ModernTemplate({ data }: TemplateProps) {
  const contactLine = buildContactLine(data.contact);

  return (
    <article className="mx-auto w-full max-w-[8.5in] bg-white p-8 text-black print:p-0">
      <header className="mb-6">
        <h2 className="text-3xl font-bold text-primary">{data.contact.fullName}</h2>
        {contactLine ? <p className="mt-1 text-sm text-muted-foreground">{contactLine}</p> : null}
      </header>

      {data.summary ? (
        <Section title="Summary">
          <p className="text-sm">{data.summary}</p>
        </Section>
      ) : null}

      {data.skills.length > 0 ? (
        <Section title="Skills">
          <p className="text-sm">{data.skills.map((skill) => skill.name).join(" · ")}</p>
        </Section>
      ) : null}

      {data.experience.length > 0 ? (
        <Section title="Experience">
          <div className="flex flex-col gap-4">
            {data.experience.map((entry) => (
              <div key={entry.id}>
                <p className="text-sm font-semibold">{entry.role}</p>
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm text-muted-foreground">
                  <span>{entry.company}</span>
                  <span>{formatDateRange(entry.startDate, entry.endDate)}</span>
                </div>
                {entry.bullets.length > 0 ? (
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {entry.bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {data.projects.length > 0 ? (
        <Section title="Projects">
          <div className="flex flex-col gap-4">
            {data.projects.map((entry) => (
              <div key={entry.id}>
                <p className="text-sm font-semibold">{entry.name}</p>
                {entry.description ? (
                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                ) : null}
                {entry.bullets.length > 0 ? (
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {entry.bullets.map((bullet, index) => (
                      <li key={index}>{bullet}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {data.education.length > 0 ? (
        <Section title="Education">
          <div className="flex flex-col gap-1">
            {data.education.map((entry, index) => (
              <div key={index} className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm">
                <span>
                  {entry.degree}
                  {entry.institution ? `, ${entry.institution}` : ""}
                </span>
                <span className="text-muted-foreground">
                  {formatDateRange(entry.startDate ?? "", entry.endDate)}
                </span>
              </div>
            ))}
          </div>
        </Section>
      ) : null}

      {data.certifications.length > 0 ? (
        <Section title="Certifications">
          <div className="flex flex-col gap-1 text-sm">
            {data.certifications.map((entry, index) => (
              <p key={index}>
                {entry.name}
                {entry.issuer ? (
                  <span className="text-muted-foreground"> — {entry.issuer}</span>
                ) : null}
              </p>
            ))}
          </div>
        </Section>
      ) : null}
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="mb-2 text-xs font-bold tracking-[0.2em] text-primary uppercase">{title}</h3>
      {children}
    </section>
  );
}
