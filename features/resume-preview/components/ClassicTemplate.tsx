import { buildContactLine } from "@/features/resume-preview/buildContactLine";
import { formatDateRange } from "@/features/resume-preview/dateFormatting";
import type { PreviewResumeData } from "@/features/resume-preview/types";

interface TemplateProps {
  data: PreviewResumeData;
}

/**
 * Traditional, ATS-friendly layout: single column, plain text, uppercase
 * section headers with a thin rule. No graphics/icons/tables (see
 * docs/PROJECT_GOAL.md "avoid unnecessary graphics or formatting that ATS
 * systems may struggle to parse").
 */
export function ClassicTemplate({ data }: TemplateProps) {
  const contactLine = buildContactLine(data.contact);

  return (
    <article className="mx-auto w-full max-w-[8.5in] bg-white p-8 text-black print:p-0">
      <header className="mb-4 border-b border-black pb-2 text-center">
        <h2 className="text-2xl font-bold tracking-wide uppercase">{data.contact.fullName}</h2>
        {contactLine ? <p className="mt-1 text-sm">{contactLine}</p> : null}
      </header>

      {data.summary ? (
        <Section title="Summary">
          <p className="text-sm">{data.summary}</p>
        </Section>
      ) : null}

      {data.skills.length > 0 ? (
        <Section title="Skills">
          <p className="text-sm">{data.skills.map((skill) => skill.name).join(", ")}</p>
        </Section>
      ) : null}

      {data.experience.length > 0 ? (
        <Section title="Experience">
          <div className="flex flex-col gap-3">
            {data.experience.map((entry) => (
              <div key={entry.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-2 text-sm font-semibold">
                  <span>
                    {entry.role} — {entry.company}
                  </span>
                  <span className="font-normal">
                    {formatDateRange(entry.startDate, entry.endDate)}
                  </span>
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
          <div className="flex flex-col gap-3">
            {data.projects.map((entry) => (
              <div key={entry.id}>
                <p className="text-sm font-semibold">{entry.name}</p>
                {entry.description ? <p className="text-sm">{entry.description}</p> : null}
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
                <span>{formatDateRange(entry.startDate ?? "", entry.endDate)}</span>
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
                {entry.issuer ? ` — ${entry.issuer}` : ""}
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
    <section className="mb-4">
      <h3 className="mb-1 border-b border-black text-sm font-bold tracking-wide uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}
