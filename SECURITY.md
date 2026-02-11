# Security Policy

Violet Vault is a privacy-first banking and budgeting application. We take the security of your financial data extremely seriously.

## Data Privacy & Encryption

Violet Vault is architected with a **Zero-Knowledge** philosophy for its hosted version:

1. **Client-Side Encryption**: All sensitive financial data is encrypted on your device before it ever reaches our servers.
2. **No Unencrypted Storage**: The hosted version of Violet Vault **does not hold any unencrypted data**. We cannot read your transactions, balances, or account details.
3. **Key Management**: Your encryption keys are derived from your password and are never stored on our servers. If you lose your password/recovery key, your data is irretrievable.

## Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| v2.x    | :white_check_mark: |
| v1.x    | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Violet Vault, please report it to us immediately using responsible disclosure:

1. **Do not create a public GitHub issue.** Vulnerabilities should be kept private until a patch is available.
2. Email `security@violetvault.app` with a description of the vulnerability.
   - Include steps to reproduce.
   - Include a Proof of Concept (PoC) if possible.
3. Our team will acknowledge receipt within 48 hours.
4. We will provide a timeline for a fix and credit you in our release notes (unless you prefer anonymity).

## Scope

**In Scope:**

- Authentication bypasses.
- Data leakage (accessing data without proper keys).
- Improper access control.
- Cross-Site Scripting (XSS) or Injection attacks.

**Out of Scope:**

- Social engineering (phishing).
- Denial of Service (DoS) attacks.
- Physical attacks against user devices.

Thank you for helping keep Violet Vault secure.
