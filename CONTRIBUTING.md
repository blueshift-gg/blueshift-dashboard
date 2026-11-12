# Contributing to Blueshift

First off, thank you for considering contributing to Blueshift! We appreciate you taking the time to help us improve.

## Types of Contributions We're Looking For

At the moment, we are only accepting a limited set of contributions to ensure we can review them in a timely manner. We are actively looking for:

- **Typos and Grammar Fixes:** If you spot any typos or grammatical errors in our course materials, or on the website, please let us know.
- **Code Example Fixes:** If you find a bug or an error in any of our code examples, please submit a pull request with a fix.

## How to Contribute

1.  **Fork the repository** and create your branch from `master`.
2.  **Make your changes.**
3.  **Submit a pull request** with a clear description of the changes you've made. Please follow the Conventional Commits specification.
    - For code example fixes, use the `fix:` prefix (e.g., `fix: correct variable name in escrow example`).
    - For typos or grammar fixes, use the `typo:` prefix (e.g., `typo: fix grammar in introduction lesson`).

## Security expectations for CI changes

Do not add build/deploy workflows or Cloudflare/R2 credentials to GitHub. Builds
and deploys run in Cloudflare Workers Builds. Build, deploy, and CI changes
require maintainer review (see `.github/CODEOWNERS`).

## Course & Challenge Contributions

Have an idea for a course or a challenge you'd like to see? We'd love to hear it! Please join our Discord to share your suggestions with the team.

We're excited to see your contributions!
