/** Next.js 15+ Response body: Node Buffer is not a valid BodyInit. */
export function bufferToBodyInit(buffer: Buffer): Uint8Array {
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
}
