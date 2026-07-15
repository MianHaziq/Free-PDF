import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import { buildContactLine } from "@/features/resume-preview/buildContactLine";
import { formatDateRange } from "@/features/resume-preview/dateFormatting";
import type { PreviewResumeData } from "@/features/resume-preview/types";

// Approximates the app's --primary/--muted-foreground theme tokens (oklch,
// not supported by react-pdf) as hex — the exported document is always
// light-mode, matching print convention, regardless of the app's theme.
const ACCENT_COLOR = "#18181b";
const MUTED_COLOR = "#71717a";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 10, fontFamily: "Helvetica", color: "#000000" },
  header: { marginBottom: 16 },
  name: { fontSize: 22, fontFamily: "Helvetica-Bold", color: ACCENT_COLOR },
  contactLine: { fontSize: 9, marginTop: 4, color: MUTED_COLOR },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 2,
    marginBottom: 5,
    textTransform: "uppercase",
    color: ACCENT_COLOR,
  },
  entry: { marginBottom: 8 },
  entryRole: { fontFamily: "Helvetica-Bold" },
  entrySubline: { flexDirection: "row", justifyContent: "space-between", color: MUTED_COLOR },
  bullet: { flexDirection: "row", marginLeft: 8, marginTop: 2 },
  bulletDot: { width: 8 },
  bulletText: { flex: 1 },
});

interface Props {
  data: PreviewResumeData;
}

/** react-pdf equivalent of features/resume-preview/components/ModernTemplate.tsx. */
export function ModernPdfDocument({ data }: Props) {
  const contactLine = buildContactLine(data.contact);

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{data.contact.fullName}</Text>
          {contactLine ? <Text style={styles.contactLine}>{contactLine}</Text> : null}
        </View>

        {data.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text>{data.summary}</Text>
          </View>
        ) : null}

        {data.skills.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text>{data.skills.map((skill) => skill.name).join(" · ")}</Text>
          </View>
        ) : null}

        {data.experience.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Experience</Text>
            {data.experience.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <Text style={styles.entryRole}>{entry.role}</Text>
                <View style={styles.entrySubline}>
                  <Text>{entry.company}</Text>
                  <Text>{formatDateRange(entry.startDate, entry.endDate)}</Text>
                </View>
                {entry.bullets.map((bullet, index) => (
                  <View key={index} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {data.projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {data.projects.map((entry) => (
              <View key={entry.id} style={styles.entry}>
                <Text style={styles.entryRole}>{entry.name}</Text>
                {entry.description ? (
                  <Text style={{ color: MUTED_COLOR }}>{entry.description}</Text>
                ) : null}
                {entry.bullets.map((bullet, index) => (
                  <View key={index} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{bullet}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {data.education.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {data.education.map((entry, index) => (
              <View key={index} style={styles.entrySubline}>
                <Text style={{ color: "#000000" }}>
                  {entry.degree}
                  {entry.institution ? `, ${entry.institution}` : ""}
                </Text>
                <Text>{formatDateRange(entry.startDate ?? "", entry.endDate)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.certifications.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {data.certifications.map((entry, index) => (
              <Text key={index}>
                {entry.name}
                {entry.issuer ? (
                  <Text style={{ color: MUTED_COLOR }}> — {entry.issuer}</Text>
                ) : null}
              </Text>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
