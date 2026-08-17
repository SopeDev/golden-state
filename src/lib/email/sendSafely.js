/** Log and swallow email failures so the primary API action still succeeds. */
export async function sendSafely(label, fn) {
  try {
    await fn()
  } catch (error) {
    console.error(`${label} failed:`, error)
  }
}
