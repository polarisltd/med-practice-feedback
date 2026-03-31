// Minimal ambient declaration for 'pg' to satisfy TypeScript when the package
// is lazily required at runtime (e.g., with eval('require')('pg')).
// This avoids a hard dependency on @types/pg during environments where the
// module isn't available at build time (e.g., Vercel/edge analysis).
declare module 'pg' {
  // We don't need full typings for runtime usage in this project; using any keeps it flexible.
  const content: any;
  export = content;
}
