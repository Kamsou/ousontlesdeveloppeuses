# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in OSLD, **please do not create a public issue**.

Contact us directly by email: **contact@ousontlesdeveloppeuses.fr**

Please include:
- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if any)

## Response Timeline

- Acknowledgment: within 48 hours
- Initial assessment: within 7 days
- Fix: depending on severity

## Scope

This policy covers:
- The website [ousontlesdeveloppeuses.fr](https://ousontlesdeveloppeuses.fr)
- The backend API
- The source code in this repository

## Best Practices for Contributors

- Never commit secrets (API keys, tokens, passwords)
- Use `.env` for sensitive variables (ignored by git)
- Validate user input server-side
- Use secure sessions provided by Auth.js

Thank you for helping keep OSLD secure!
