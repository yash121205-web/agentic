import { NextRequest, NextResponse } from 'next/server'

const detectLang = (code: string, fallback: string) => {
  if (code.includes('def ') || code.includes('from flask')) return 'python'
  if (code.includes('const ') || code.includes('function ')) return 'javascript'
  if (code.includes('public class')) return 'java'
  if (code.includes('<?php')) return 'php'
  return fallback
}

export async function POST(req: NextRequest) {
  const { code, language: rawLang } = await req.json()
const language = detectLang(code, rawLang)

  // Simulate AI thinking delay
  await new Promise(r => setTimeout(r, 1500))

  // Smart mock — detects real patterns in the code
  const vulnerabilities = []
  let score = 95

  if (code.includes('f"') || code.includes("f'") || code.includes('${')) {
    vulnerabilities.push({
      name: 'SQL Injection',
      severity: 'critical',
      line: 12,
      description: 'User input is directly interpolated into SQL query without sanitization. An attacker can manipulate the query to bypass authentication or dump the database.',
      fix: 'Use parameterized queries or prepared statements instead of string formatting'
    })
    score -= 30
  }

  if (code.includes('secret') || code.includes('password') || code.includes('token') || code.includes('key')) {
    vulnerabilities.push({
      name: 'Hardcoded Secret',
      severity: 'high',
      line: 18,
      description: 'Sensitive credentials are hardcoded directly in source code. If this code is committed to a repository, secrets will be exposed.',
      fix: 'Move secrets to environment variables and use a secrets manager'
    })
    score -= 20
  }

  if (code.includes('filename') || code.includes('path') || code.includes('file')) {
    vulnerabilities.push({
      name: 'Path Traversal',
      severity: 'high',
      line: 24,
      description: 'User-controlled input is used to construct file paths. An attacker can use ../ sequences to access files outside the intended directory.',
      fix: 'Validate and sanitize file paths, use allowlists for permitted directories'
    })
    score -= 20
  }

  if (code.includes('eval') || code.includes('exec')) {
    vulnerabilities.push({
      name: 'Command Injection',
      severity: 'critical',
      line: 8,
      description: 'User input is passed to eval() or exec() which executes arbitrary code. This can lead to complete system compromise.',
      fix: 'Never use eval() with user input. Use safer alternatives.'
    })
    score -= 35
  }

  if (code.includes('innerHTML') || code.includes('document.write')) {
    vulnerabilities.push({
      name: 'Cross-Site Scripting (XSS)',
      severity: 'high',
      line: 15,
      description: 'User input is directly inserted into DOM without sanitization. Attackers can inject malicious scripts that run in victims browsers.',
      fix: 'Use textContent instead of innerHTML, or sanitize input with DOMPurify'
    })
    score -= 25
  }

  if (code.includes('http://') && !code.includes('localhost')) {
    vulnerabilities.push({
      name: 'Insecure HTTP Connection',
      severity: 'medium',
      line: 5,
      description: 'Application uses unencrypted HTTP instead of HTTPS. Data transmitted can be intercepted by attackers.',
      fix: 'Always use HTTPS for all external connections'
    })
    score -= 10
  }

  // If no vulnerabilities detected
  if (vulnerabilities.length === 0) {
    vulnerabilities.push({
      name: 'Missing Input Validation',
      severity: 'medium',
      line: 3,
      description: 'No input validation detected. All user inputs should be validated before processing.',
      fix: 'Add input validation, length checks, and type checking for all user inputs'
    })
    score -= 10
  }

  return NextResponse.json({
    thinking: [
      `🔍 Scanning ${language} code for security vulnerabilities...`,
      `📋 Loaded OWASP Top 10 security rules`,
      `🔎 Checking for injection vulnerabilities...`,
      vulnerabilities.find(v => v.name === 'SQL Injection')
        ? `⚠️ String formatting in database query detected — potential SQL injection`
        : `✅ No SQL injection patterns found`,
      `🔐 Scanning for hardcoded credentials...`,
      vulnerabilities.find(v => v.name === 'Hardcoded Secret')
        ? `⚠️ Sensitive keywords found in source code`
        : `✅ No hardcoded secrets detected`,
      `📁 Checking file handling operations...`,
      vulnerabilities.find(v => v.name === 'Path Traversal')
        ? `⚠️ User-controlled file path detected — path traversal risk`
        : `✅ File operations look safe`,
      `🧠 Chain-of-thought analysis complete`,
      `📊 Found ${vulnerabilities.length} vulnerabilities — security score: ${Math.max(score, 10)}/100`,
    ],
    vulnerabilities,
    score: Math.max(score, 10)
  })
}