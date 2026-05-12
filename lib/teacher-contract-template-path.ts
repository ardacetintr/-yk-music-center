import path from "path";

/**
 * İş sözleşmesi gövdesi UTF-8 `.txt` dosyasıdır; `{alanAdı}` yer tutucuları kod ile doldurulur.
 * Yol yalnızca proje kökü altında çözülür; mutlak path ve `..` kaçışına izin verilmez.
 * Üretimde şablonu repoya koymayıp sunucuda tutmak için TEACHER_CONTRACT_TEMPLATE_PATH ile
 * örn. private/sozlesme.txt (göreli) kullanılabilir.
 */
export function resolveTeacherContractTemplatePath():
  | { ok: true; absolutePath: string }
  | { ok: false; reason: "absolute_forbidden" | "path_escape" } {
  const cwd = process.cwd();
  const envRaw = process.env.TEACHER_CONTRACT_TEMPLATE_PATH?.trim();
  let relative = envRaw ?? path.join("private", "teacher-contract-template.txt");

  if (path.isAbsolute(relative)) {
    return { ok: false, reason: "absolute_forbidden" };
  }

  relative = relative.replace(/^[\\/]+/, "");
  const resolved = path.resolve(cwd, relative);
  const relToCwd = path.relative(cwd, resolved);

  if (relToCwd.startsWith("..") || path.isAbsolute(relToCwd)) {
    return { ok: false, reason: "path_escape" };
  }

  return { ok: true, absolutePath: resolved };
}
