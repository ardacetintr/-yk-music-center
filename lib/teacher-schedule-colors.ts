/** Ders programı kartları — öğretmen başına sabit, soluk arka plan (yazı okunaklı). */
export type TeacherScheduleColors = {
  cardClass: string;
  timeClass: string;
  studentClass: string;
  teacherClass: string;
  labelClass: string;
  legendDotClass: string;
};

const NEUTRAL: TeacherScheduleColors = {
  cardClass: "border-zinc-700/80 bg-black/40",
  timeClass: "text-brand-200/90",
  studentClass: "text-zinc-100",
  teacherClass: "text-zinc-500",
  labelClass: "text-zinc-600",
  legendDotClass: "bg-zinc-500/60 ring-zinc-500/30"
};

/** Mavi, sarı, yeşil, kırmızı ve ek tonlar — düşük doygunluk */
const PALETTE: TeacherScheduleColors[] = [
  {
    cardClass: "border-sky-500/40 bg-sky-950/50",
    timeClass: "text-sky-300/95",
    studentClass: "text-zinc-100",
    teacherClass: "text-sky-200/85",
    labelClass: "text-sky-300/60",
    legendDotClass: "bg-sky-500/75 ring-sky-400/35"
  },
  {
    cardClass: "border-amber-500/40 bg-amber-950/45",
    timeClass: "text-amber-200/95",
    studentClass: "text-zinc-100",
    teacherClass: "text-amber-200/85",
    labelClass: "text-amber-300/55",
    legendDotClass: "bg-amber-500/75 ring-amber-400/35"
  },
  {
    cardClass: "border-emerald-500/40 bg-emerald-950/45",
    timeClass: "text-emerald-300/95",
    studentClass: "text-zinc-100",
    teacherClass: "text-emerald-200/85",
    labelClass: "text-emerald-300/55",
    legendDotClass: "bg-emerald-500/75 ring-emerald-400/35"
  },
  {
    cardClass: "border-rose-500/40 bg-rose-950/45",
    timeClass: "text-rose-300/95",
    studentClass: "text-zinc-100",
    teacherClass: "text-rose-200/85",
    labelClass: "text-rose-300/55",
    legendDotClass: "bg-rose-500/75 ring-rose-400/35"
  },
  {
    cardClass: "border-violet-500/40 bg-violet-950/45",
    timeClass: "text-violet-300/95",
    studentClass: "text-zinc-100",
    teacherClass: "text-violet-200/85",
    labelClass: "text-violet-300/55",
    legendDotClass: "bg-violet-500/75 ring-violet-400/35"
  },
  {
    cardClass: "border-teal-500/40 bg-teal-950/45",
    timeClass: "text-teal-300/95",
    studentClass: "text-zinc-100",
    teacherClass: "text-teal-200/85",
    labelClass: "text-teal-300/55",
    legendDotClass: "bg-teal-500/75 ring-teal-400/35"
  },
  {
    cardClass: "border-orange-500/40 bg-orange-950/40",
    timeClass: "text-orange-300/95",
    studentClass: "text-zinc-100",
    teacherClass: "text-orange-200/85",
    labelClass: "text-orange-300/55",
    legendDotClass: "bg-orange-500/75 ring-orange-400/35"
  },
  {
    cardClass: "border-cyan-500/40 bg-cyan-950/45",
    timeClass: "text-cyan-300/95",
    studentClass: "text-zinc-100",
    teacherClass: "text-cyan-200/85",
    labelClass: "text-cyan-300/55",
    legendDotClass: "bg-cyan-500/75 ring-cyan-400/35"
  }
];

/** Turuncu / teal / cyan ile karışmaması için — yalnızca isim eşleşmesinde */
const FUCHSIA: TeacherScheduleColors = {
  cardClass: "border-fuchsia-500/40 bg-fuchsia-950/45",
  timeClass: "text-fuchsia-300/95",
  studentClass: "text-zinc-100",
  teacherClass: "text-fuchsia-200/85",
  labelClass: "text-fuchsia-300/55",
  legendDotClass: "bg-fuchsia-500/75 ring-fuchsia-400/35"
};

function normalizeTeacherName(name: string): string {
  return name.trim().toLocaleLowerCase("tr-TR");
}

/** Çakışan veya çok yakın görünen hocalar — teacherId ortamdan ortama değişebilir */
const TEACHER_NAME_COLOR_OVERRIDES: Record<string, TeacherScheduleColors> = {
  [normalizeTeacherName("Batuhan Arslan")]: FUCHSIA
};

function hashTeacherId(teacherId: string): number {
  let h = 0;
  for (let i = 0; i < teacherId.length; i++) {
    h = (h * 31 + teacherId.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function getTeacherScheduleColors(
  teacherId: string | null | undefined,
  teacherName?: string | null
): TeacherScheduleColors {
  if (teacherName) {
    const override = TEACHER_NAME_COLOR_OVERRIDES[normalizeTeacherName(teacherName)];
    if (override) return override;
  }
  if (!teacherId) return NEUTRAL;
  return PALETTE[hashTeacherId(teacherId) % PALETTE.length] ?? NEUTRAL;
}
