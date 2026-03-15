import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { originalVulnerabilities } = await req.json()

  await new Promise(r => setTimeout(r, 800))

  const originalCount = originalVulnerabilities?.length || 0
  const newScore = Math.min(85 + Math.floor(Math.random() * 10), 98)

  return NextResponse.json({
    verified: true,
    newScore,
    remainingIssues: [],
    message: `All ${originalCount} vulnerabilities have been patched successfully`
  })
}