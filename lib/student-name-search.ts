/** Türkçe ad/soyad araması (i/ı vb. için tr locale). */
export function matchesStudentNameSearch(name: string, query: string): boolean {
  const q = query.trim().toLocaleLowerCase("tr");
  if (!q) return true;
  return name.toLocaleLowerCase("tr").includes(q);
}
