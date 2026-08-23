import PDFDocument from 'pdfkit';

export type BudgetPdfItem = {
  quantity: number;
  discount: number;
  totalPrice: number;
  produtos?: { name: string; price: number } | null;
  servicos?: { name: string; price: number } | null;
};

export type BudgetPdfData = {
  id: number;
  totalPrice: number;
  discount: number;
  status: string;
  createdAt: Date;
  validUntil?: Date | null;
  items: BudgetPdfItem[];
  user: { name: string; email: string };
  client: { name: string; email: string; phone: string; address: string };
  company?: { name: string; cnpj: string; phone: string; email: string; address: string; city: string } | null;
};

const currency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const date = (value: Date) => value.toLocaleDateString('pt-BR');

export async function generateBudgetPdf(budget: BudgetPdfData): Promise<Buffer> {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });
  const chunks: Buffer[] = [];

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  if (budget.company) {
    doc.fontSize(16).text(budget.company.name, { continued: false });
    doc.fontSize(9).fillColor('#555')
      .text(`CNPJ: ${budget.company.cnpj}  •  ${budget.company.phone}  •  ${budget.company.email}`)
      .text(`${budget.company.address} - ${budget.company.city}`)
      .fillColor('#000');
    doc.moveDown();
  }

  doc.fontSize(18).text(`Orçamento #${budget.id}`, { align: 'right' });
  doc.fontSize(10).fillColor('#555')
    .text(`Emitido em ${date(budget.createdAt)}`, { align: 'right' })
    .text(`Status: ${budget.status}`, { align: 'right' });
  if (budget.validUntil) {
    doc.text(`Válido até ${date(budget.validUntil)}`, { align: 'right' });
  }
  doc.fillColor('#000').moveDown();

  doc.fontSize(12).text('Cliente', { underline: true });
  doc.fontSize(10)
    .text(budget.client.name)
    .text(budget.client.email)
    .text(budget.client.phone)
    .text(budget.client.address);
  doc.moveDown();

  doc.fontSize(12).text('Responsável', { underline: true });
  doc.fontSize(10).text(`${budget.user.name} (${budget.user.email})`);
  doc.moveDown();

  doc.fontSize(12).text('Itens', { underline: true });
  doc.moveDown(0.5);

  const columns = [
    { label: 'Descrição', width: 220 },
    { label: 'Qtd', width: 50 },
    { label: 'Preço unit.', width: 90 },
    { label: 'Desc.', width: 50 },
    { label: 'Total', width: 90 },
  ];
  const startX = doc.x;
  let y = doc.y;

  doc.fontSize(9).fillColor('#555');
  let x = startX;
  for (const col of columns) {
    doc.text(col.label, x, y, { width: col.width, continued: false });
    x += col.width;
  }
  doc.fillColor('#000');
  y += 15;
  doc.moveTo(startX, y).lineTo(x, y).strokeColor('#ccc').stroke();
  y += 5;

  for (const item of budget.items) {
    const name = item.produtos?.name ?? item.servicos?.name ?? 'Item removido';
    const unitPrice = item.produtos?.price ?? item.servicos?.price ?? 0;

    if (y > 700) {
      doc.addPage();
      y = doc.y;
    }

    x = startX;
    doc.fontSize(9);
    doc.text(name, x, y, { width: columns[0].width }); x += columns[0].width;
    doc.text(String(item.quantity), x, y, { width: columns[1].width }); x += columns[1].width;
    doc.text(currency(unitPrice), x, y, { width: columns[2].width }); x += columns[2].width;
    doc.text(`${item.discount}%`, x, y, { width: columns[3].width }); x += columns[3].width;
    doc.text(currency(item.totalPrice), x, y, { width: columns[4].width });

    y += 20;
  }

  y += 10;
  doc.moveTo(startX, y).lineTo(x, y).strokeColor('#ccc').stroke();
  y += 15;

  doc.fontSize(10).text(`Desconto geral: ${budget.discount}%`, startX, y, { align: 'right' });
  y += 18;
  doc.fontSize(14).text(`Total: ${currency(budget.totalPrice)}`, startX, y, { align: 'right' });

  doc.end();

  return done;
}
