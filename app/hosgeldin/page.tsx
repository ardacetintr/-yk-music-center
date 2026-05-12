import { redirect } from "next/navigation";
import HosgeldinHero from "@/components/HosgeldinHero";
import { getServerSession } from "@/lib/auth";
import { greetingDisplayName } from "@/lib/display-name";

export default async function HosgeldinPage() {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    redirect("/admin/login");
  }

  return <HosgeldinHero name={greetingDisplayName(session.name)} />;
}
