declare module "pdfmake/build/vfs_fonts.js" {
  const vfs: Record<string, string>;
  export default vfs;
}

declare module "pdfmake" {
  interface PdfKitDocument extends NodeJS.ReadableStream {
    end(): void;
  }

  class PdfPrinter {
    constructor(fonts: Record<string, unknown>);
    createPdfKitDocument(docDefinition: unknown): PdfKitDocument;
  }

  export default PdfPrinter;
}
