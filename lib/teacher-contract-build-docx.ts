import {
  AlignmentType,
  Document,
  LineRuleType,
  Packer,
  Paragraph,
  Tab,
  TextRun,
} from "docx";
import { readTeacherContractDocxTheme } from "@/lib/teacher-contract-docx-env";
import { autoAlignColonLines, plainTextToPhysicalLines } from "@/lib/teacher-contract-text-layout";

function paragraphRuns(line: string, font: string, fontSizeHalfPt: number): (TextRun | Tab)[] {
  const parts = line.split("\t");
  const children: (TextRun | Tab)[] = [];
  for (let i = 0; i < parts.length; i++) {
    children.push(new TextRun({ text: parts[i], font, size: fontSizeHalfPt }));
    if (i < parts.length - 1) {
      children.push(new Tab());
    }
  }
  return children;
}

/**
 * Dolu UTF-8 metinden .docx üretir.
 * Kural: .txt’deki her satır = Word’de bir paragraf; boş satır = boş paragraf (dikey boşluk korunur).
 * Sekme (\t) gerçek sekmedir; çoklu boşluk OOXML’de korunur (w:t xml:space preserve).
 * Sayfa düzeni: `.env` içinde TEACHER_CONTRACT_DOCX_* değişkenleri (bkz. .env.example).
 */
export async function filledContractTextToDocxBuffer(text: string): Promise<Buffer> {
  const theme = readTeacherContractDocxTheme();
  const lines = autoAlignColonLines(plainTextToPhysicalLines(text));

  const children = lines.map((line) => {
    if (line.length === 0) {
      return new Paragraph({
        includeIfEmpty: true,
        spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
        children: [],
      });
    }
    return new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { before: 0, after: 0, line: 240, lineRule: LineRuleType.AUTO },
      children: paragraphRuns(line, theme.font, theme.fontSizeHalfPt),
    });
  });

  const doc = new Document({
    defaultTabStop: theme.tabTwips,
    sections: [
      {
        properties: {
          page: {
            margin: theme.marginTwips,
          },
        },
        children,
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  return Buffer.from(buf);
}
