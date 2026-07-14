# Project Goal - Resume Tailoring Platform

## Vision

The goal of this project is to build a **personal Resume Tailoring
Platform** that can quickly transform an existing resume into a version
that is highly relevant for a specific job description while remaining
truthful, ATS-friendly, and professionally formatted.

This project is designed for a single user and focuses on helping create
targeted resumes for different software engineering roles without
manually editing the resume each time.

------------------------------------------------------------------------

# Primary Objective

Given:

-   An existing resume (PDF, DOCX, or JSON)
-   A job description (text, PDF, or DOCX)

The application should:

1.  Analyze the uploaded resume.
2.  Analyze the job description.
3.  Compare both documents.
4.  Identify matching and missing skills.
5.  Prioritize the most relevant experience.
6.  Reorder sections where appropriate.
7.  Improve keyword placement.
8.  Generate a tailored resume that is optimized for the target role.
9.  Produce an ATS-friendly resume ready for submission.

The application should preserve the user's real experience and never
invent skills, technologies, companies, or achievements.

------------------------------------------------------------------------

# Example Scenarios

## Backend Developer

If the original resume represents a Full Stack Developer and the target
role is Backend Developer, the application should:

-   Prioritize backend projects.
-   Emphasize NestJS, Node.js, PostgreSQL, REST APIs, authentication,
    RBAC, Docker, Redis, message queues, testing, and backend
    architecture.
-   Move backend skills higher in the skills section.
-   Reduce emphasis on frontend-heavy work where appropriate.
-   Update the professional summary to reflect backend expertise.

------------------------------------------------------------------------

## Frontend Developer

If applying for a Frontend role, the application should:

-   Highlight React, Next.js, TypeScript, UI development, responsive
    design, performance optimization, accessibility, and frontend
    architecture.
-   Prioritize frontend projects.
-   Reduce emphasis on backend-only work.
-   Generate a frontend-focused professional summary.

------------------------------------------------------------------------

## Full Stack Developer

For Full Stack positions, the application should balance frontend and
backend experience while emphasizing end-to-end application development.

------------------------------------------------------------------------

## AI / Machine Learning Engineer

If the resume contains relevant AI, ML, data science, automation, or LLM
experience, the application should prioritize those experiences and
keywords. If no relevant experience exists, it must not fabricate AI
experience.

------------------------------------------------------------------------

## Software Engineer

For general Software Engineer positions, the application should present
the strongest overall engineering experience by highlighting
architecture, problem solving, scalability, system design,
collaboration, and software development practices.

------------------------------------------------------------------------

# ATS Optimization Goals

Every tailored resume should:

-   Include important keywords from the job description.
-   Improve keyword coverage naturally.
-   Maintain clean formatting.
-   Follow ATS-friendly structure.
-   Avoid unnecessary graphics or formatting that ATS systems may
    struggle to parse.
-   Generate an ATS compatibility score with actionable recommendations.

------------------------------------------------------------------------

# Tailoring Rules

The tailoring engine must:

-   Never invent experience.
-   Never invent technologies.
-   Never invent companies.
-   Never invent achievements.
-   Never misrepresent years of experience.
-   Only reorganize and improve existing information.
-   Clearly identify missing skills instead of pretending they exist.

------------------------------------------------------------------------

# Output

The application should provide:

-   Original resume preview.
-   Tailored resume preview.
-   ATS report.
-   Matching score.
-   Missing keywords.
-   Suggested improvements.
-   Export options (PDF and DOCX).

Users should be able to either update the existing resume structure or
generate a new tailored version while preserving the original resume.

------------------------------------------------------------------------

# Long-Term Goal

The long-term objective is to reduce resume customization time from
30--60 minutes to less than one minute while producing high-quality,
truthful, ATS-optimized resumes tailored to different software
engineering roles, increasing the likelihood of passing ATS screening
and attracting recruiter attention.
