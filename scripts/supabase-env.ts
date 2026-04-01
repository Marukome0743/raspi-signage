const proc = Bun.spawn(["supabase", "status", "--output", "json"], {
  stdout: "pipe",
  stderr: "inherit",
})

const output = await new Response(proc.stdout).text()
const exitCode = await proc.exited
if (exitCode !== 0) {
  console.error("Failed to get Supabase status. Is Supabase running?")
  process.exit(1)
}

const status = JSON.parse(output)
const env = `NEXT_PUBLIC_SUPABASE_URL=${status.API_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${status.ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${status.SERVICE_ROLE_KEY}
`

await Bun.write(".env", env)
console.log("✅ .env generated")
console.log(env)

export {}
