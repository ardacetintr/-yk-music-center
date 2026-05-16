/** Next.js 15+ Response body: Node Buffer is not a valid BodyInit. */
export function bufferToResponseBody(buffer: Buffer): Blob {
  const bytes = Uint8Array.from(buffer);
  return new Blob([bytes]);
}
