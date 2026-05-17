"use client";

import { useRouter } from "next/navigation";

export default function AttendanceDatePicker({ sessionDate }: { sessionDate: string }) {
  const router = useRouter();

  return (
    <label className="flex max-w-xs flex-col gap-1 text-xs text-zinc-500">
      Tarih seç
      <input
        type="date"
        defaultValue={sessionDate}
        className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
        onChange={(e) => {
          const v = e.target.value;
          if (v) router.push(`/admin/attendance?date=${v}`);
        }}
      />
    </label>
  );
}
