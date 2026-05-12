import { autoAlignColonLines, plainTextToPhysicalLines } from "@/lib/teacher-contract-text-layout";

type RobotoFontSet = {
  normal: Buffer;
  bold: Buffer;
  italics: Buffer;
  bolditalics: Buffer;
};

const ROBOTO_VFS_KEYS = [
  "Roboto-Regular.ttf",
  "Roboto-Medium.ttf",
  "Roboto-Italic.ttf",
  "Roboto-MediumItalic.ttf",
] as const;

async function robotoFontsFromPdfMakeVfs(): Promise<{ Roboto: RobotoFontSet }> {
  const vfsMod = await import("pdfmake/build/vfs_fonts.js");
  const vfs = (vfsMod as { default: Record<string, string> }).default;
  for (const k of ROBOTO_VFS_KEYS) {
    if (!vfs[k] || typeof vfs[k] !== "string") {
      throw new Error("PDFMAKE_ROBOTO_FONTS_MISSING");
    }
  }
  const b = (k: (typeof ROBOTO_VFS_KEYS)[number]) => Buffer.from(vfs[k], "base64");
  return {
    Roboto: {
      normal: b("Roboto-Regular.ttf"),
      bold: b("Roboto-Medium.ttf"),
      italics: b("Roboto-Italic.ttf"),
      bolditalics: b("Roboto-MediumItalic.ttf"),
    },
  };
}

/** PDF’de satır yapısı korunur; Word ile birebir örtüşmez (font ve sekme ölçüsü farklı). */
export async function filledContractTextToPdfBuffer(text: string): Promise<Buffer> {
  const fonts = await robotoFontsFromPdfMakeVfs();
  const PdfPrinter = (await import("pdfmake")).default;
  const printer = new PdfPrinter(fonts);

  const lines = autoAlignColonLines(plainTextToPhysicalLines(text));
  const content = lines.map((line) => ({
    text: line,
    alignment: "left" as const,
    preserveLeadingSpaces: true,
    preserveTrailingSpaces: true,
    fontSize: 11,
    lineHeight: 1,
    margin: [0, 0, 0, 0],
  }));

  const docDefinition = {
    pageMargins: [56, 56, 56, 56],
    defaultStyle: {
      font: "Roboto",
      fontSize: 11,
    },
    content,
  };

  return await new Promise((resolve, reject) => {
    try {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      const chunks: Buffer[] = [];
      pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
      pdfDoc.on("error", reject);
      pdfDoc.end();
    } catch (e) {
      reject(e);
    }
  });
}
