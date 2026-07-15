import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

import { buildContactLine } from "@/features/resume-preview/buildContactLine";
import { formatDateRange } from "@/features/resume-preview/dateFormatting";
import type { PreviewResumeData } from "@/features/resume-preview/types";

const SECTION_HEADER_BORDER = {
  bottom: { style: BorderStyle.SINGLE, size: 4, color: "000000" },
};

function sectionHeading(title: string): Paragraph {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    border: SECTION_HEADER_BORDER,
    spacing: { before: 200, after: 100 },
    children: [new TextRun({ text: title.toUpperCase(), bold: true })],
  });
}

function bulletParagraph(text: string): Paragraph {
  return new Paragraph({ text, bullet: { level: 0 } });
}

/**
 * A single, clean, ATS-safe DOCX layout (docs/PROJECT_GOAL.md — plain
 * text, no tables/graphics). Unlike the PDF export, there's only one
 * template here: visual variety matters far less for an editable Word
 * document than a downloadable/printed PDF, and it keeps the exporter
 * simple.
 */
export async function generateDocxBlob(data: PreviewResumeData): Promise<Blob> {
  const contactLine = buildContactLine(data.contact);
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: data.contact.fullName, bold: true })],
    }),
  ];

  if (contactLine) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: contactLine, size: 18 })],
      }),
    );
  }

  if (data.summary) {
    children.push(sectionHeading("Summary"), new Paragraph({ text: data.summary }));
  }

  if (data.skills.length > 0) {
    children.push(
      sectionHeading("Skills"),
      new Paragraph({ text: data.skills.map((skill) => skill.name).join(", ") }),
    );
  }

  if (data.experience.length > 0) {
    children.push(sectionHeading("Experience"));
    for (const entry of data.experience) {
      children.push(
        new Paragraph({
          spacing: { before: 100 },
          children: [
            new TextRun({ text: `${entry.role} — ${entry.company}`, bold: true }),
            new TextRun({ text: `\t${formatDateRange(entry.startDate, entry.endDate)}` }),
          ],
        }),
      );
      for (const bullet of entry.bullets) {
        children.push(bulletParagraph(bullet));
      }
    }
  }

  if (data.projects.length > 0) {
    children.push(sectionHeading("Projects"));
    for (const entry of data.projects) {
      children.push(
        new Paragraph({
          spacing: { before: 100 },
          children: [new TextRun({ text: entry.name, bold: true })],
        }),
      );
      if (entry.description) {
        children.push(new Paragraph({ text: entry.description }));
      }
      for (const bullet of entry.bullets) {
        children.push(bulletParagraph(bullet));
      }
    }
  }

  if (data.education.length > 0) {
    children.push(sectionHeading("Education"));
    for (const entry of data.education) {
      const label = entry.institution ? `${entry.degree}, ${entry.institution}` : entry.degree;
      const dateRange = formatDateRange(entry.startDate ?? "", entry.endDate);
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: label }),
            ...(dateRange ? [new TextRun({ text: `\t${dateRange}` })] : []),
          ],
        }),
      );
    }
  }

  if (data.certifications.length > 0) {
    children.push(sectionHeading("Certifications"));
    for (const entry of data.certifications) {
      children.push(
        new Paragraph({
          text: entry.issuer ? `${entry.name} — ${entry.issuer}` : entry.name,
        }),
      );
    }
  }

  const document = new Document({ sections: [{ properties: {}, children }] });
  return Packer.toBlob(document);
}
