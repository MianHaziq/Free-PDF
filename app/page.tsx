export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center font-sans">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Resume Tailoring Platform
      </h1>
      <p className="max-w-prose text-base text-foreground/70 sm:text-lg">
        Upload a resume and a job description to generate an ATS-optimized,
        truthful, tailored resume. Feature modules are under active
        development per the phased build plan in{" "}
        <code className="font-mono text-sm text-foreground">docs/</code>.
      </p>
    </main>
  );
}
