import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generateSamplePDF(type: 'contract' | 'invoice' | 'form' = 'contract'): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 format in points

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const timesFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

  if (type === 'contract') {
    // Header banner
    page.drawRectangle({
      x: 40,
      y: 770,
      width: 515,
      height: 45,
      color: rgb(0.12, 0.23, 0.54),
    });

    page.drawText('CONTRATO DE PRESTAÇÃO DE SERVIÇOS', {
      x: 60,
      y: 785,
      size: 16,
      font: helveticaBold,
      color: rgb(1, 1, 1),
    });

    // Subheader
    page.drawText('Documento Oficial de Acordo Comercial n. 2026/089', {
      x: 40,
      y: 745,
      size: 10,
      font: helveticaFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Content section 1
    page.drawText('1. PARTES CONTRATANTES', {
      x: 40,
      y: 710,
      size: 12,
      font: timesBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page.drawText('CONTRATANTE: Tech Solutions Brasil Ltda., CNPJ: 12.345.678/0001-90', {
      x: 40,
      y: 685,
      size: 11,
      font: timesFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText('CONTRATADO: João Carlos Silva, CPF: 987.654.321-00', {
      x: 40,
      y: 665,
      size: 11,
      font: timesFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Content section 2
    page.drawText('2. OBJETO DO CONTRATO', {
      x: 40,
      y: 625,
      size: 12,
      font: timesBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page.drawText('O presente contrato tem por objeto o desenvolvimento de software web', {
      x: 40,
      y: 600,
      size: 11,
      font: timesFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText('e consultoria técnica em inteligência artificial e edição de arquivos PDF.', {
      x: 40,
      y: 580,
      size: 11,
      font: timesFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Content section 3
    page.drawText('3. VALOR E CONDIÇÕES DE PAGAMENTO', {
      x: 40,
      y: 540,
      size: 12,
      font: timesBold,
      color: rgb(0.1, 0.1, 0.1),
    });

    page.drawText('Pela prestação dos serviços objeto deste contrato, a CONTRATANTE pagará', {
      x: 40,
      y: 515,
      size: 11,
      font: timesFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText('ao CONTRATADO a quantia total de R$ 15.500,00 (quinze mil e quinhentos reais).', {
      x: 40,
      y: 495,
      size: 11,
      font: timesFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Interactive sample box area
    page.drawRectangle({
      x: 40,
      y: 360,
      width: 515,
      height: 100,
      color: rgb(0.96, 0.97, 1.0),
      borderColor: rgb(0.8, 0.85, 0.95),
      borderWidth: 1,
    });

    page.drawText('OBSERVAÇÕES E CLÁUSULAS ADICIONAIS:', {
      x: 55,
      y: 435,
      size: 10,
      font: helveticaBold,
      color: rgb(0.12, 0.23, 0.54),
    });

    page.drawText('• Prazo de entrega estipulado: 30 dias úteis a contar da assinatura.', {
      x: 55,
      y: 415,
      size: 10,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText('• Garantia de suporte técnico: 90 dias após a homologação final.', {
      x: 55,
      y: 395,
      size: 10,
      font: helveticaFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Signature Area
    page.drawText('São Paulo, 09 de Outubro de 2026', {
      x: 40,
      y: 280,
      size: 10,
      font: timesFont,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Signature lines
    page.drawLine({
      start: { x: 50, y: 180 },
      end: { x: 250, y: 180 },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('CONTRATANTE', {
      x: 100,
      y: 165,
      size: 10,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawLine({
      start: { x: 300, y: 180 },
      end: { x: 500, y: 180 },
      thickness: 1,
      color: rgb(0.5, 0.5, 0.5),
    });

    page.drawText('CONTRATADO', {
      x: 350,
      y: 165,
      size: 10,
      font: helveticaBold,
      color: rgb(0.2, 0.2, 0.2),
    });
  }

  return await pdfDoc.save();
}
