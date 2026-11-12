# Security Policy

## Reporting a Vulnerability

- Submit a private report via the security advisory form: https://github.com/blueshift-gg/blueshift-dashboard/security/advisories/new.
- Do not create public GitHub issues or discuss details publicly until we have confirmed and resolved the problem.
- Include a detailed description of the issue, steps to reproduce, and any proof-of-concept artifacts or logs that will help us triage quickly.

## Response Commitments

- We aim to release fixes as soon as possible; timelines depend on severity, complexity, and coordinated disclosure planning.

## Deployment and CI Security

Workers Builds preview builds run branch code with the Workers Builds token. The
default token can edit Workers, KV, R2, and routes account-wide. Turn on
**Enable Preview Builds** only if every branch writer is trusted; otherwise
disable it. Use a custom minimal token and an isolated account or broker for
isolation. Protect `previews.learn.blueshift.gg` with Cloudflare Access.

Revoke old GitHub Actions/R2 credentials and delete old preview Workers,
`compiled-mdx-preview/*` objects, and the unused `blueshift-edu-content` bucket.
Repo guards do not isolate preview builds. Require Code Owners review.

## Preferred Practices for Researchers

- Respect user privacy and data protection at all times; avoid accessing or modifying data that does not belong to you.
- Use your own accounts when possible and limit requests to what is necessary to demonstrate the vulnerability.
- Allow us reasonable time to investigate, triage, and remediate before any public disclosure.

Thanks for helping keep Blueshift safe for everyone.
