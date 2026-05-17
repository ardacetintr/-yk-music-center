"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getServerSession } from "@/lib/auth";
import { parseTurkishMoneyInput } from "@/lib/money";
import { prisma } from "@/lib/prisma";

const PAGE_PATH = "/admin/instrument-sales";
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function ensureAdmin() {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
}

function revalidateSales() {
  revalidatePath(PAGE_PATH);
}

export async function addInstrumentSale(formData: FormData) {
  await ensureAdmin();

  const instrumentName = String(formData.get("instrumentName") ?? "").trim();
  const buyerName = String(formData.get("buyerName") ?? "").trim();
  const soldDate = String(formData.get("soldDate") ?? "").trim();
  const amountRaw = String(formData.get("price") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (instrumentName.length < 2) throw new Error("Enstrüman adı en az 2 karakter olmalıdır.");
  if (buyerName.length < 2) throw new Error("Müşteri en az 2 karakter olmalıdır.");
  if (!ISO_DATE.test(soldDate)) throw new Error("Tarih YYYY-AA-GG olmalıdır.");

  const price = parseTurkishMoneyInput(amountRaw);
  if (price === null || price <= 0) throw new Error("Geçerli bir satış fiyatı girin.");

  await prisma.instrumentSale.create({
    data: {
      instrumentName,
      buyerName,
      soldDate,
      price: new Prisma.Decimal(price),
      notes
    }
  });

  revalidateSales();
}

export async function deleteInstrumentSale(formData: FormData) {
  await ensureAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Kayıt bulunamadı.");

  await prisma.instrumentSale.delete({ where: { id } });
  revalidateSales();
}
