const PDFDocument = require("pdfkit")

async function generateInvoicePDF(invoiceData) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
        layout: 'landscape'
      })

      const pageWidth = doc.page.width
      const pageHeight = doc.page.height

      const chunks = []
      doc.on("data", (chunk) => chunks.push(chunk))
      doc.on("end", () => resolve(Buffer.concat(chunks)))
      doc.on("error", reject)

      console.log("Invoice data received:", invoiceData)

      // Colors
      const primaryColor = '#2563eb'
      const grayColor = '#6b7280'
      const lightGrayColor = '#f3f4f6'

      // Company Header Section
      doc.fontSize(28)
          .fillColor(primaryColor)
          .text('Your Company', 50, 50, { width: 300 })

      // Invoice Title (Top Right)
      doc.fontSize(24)
          .fillColor('#1f2937')
          .text('Sales Invoice', 400, 50, { align: 'right' })

      // Company Details (Left Side)
      let leftY = 85
      doc.fontSize(10)
          .fillColor('#000000')
          .text('Your Company Name', 50, leftY)
      doc.text('VAT REG TIN: 000-000-000-000', 50, leftY += 12)
      doc.text('123 Business Street, Business District', 50, leftY += 12)
      doc.text('Metro Manila, Philippines 1000', 50, leftY += 12)

      leftY += 20
      doc.text('Phone:', 50, leftY, { continued: true })
          .text('+63 2 8888 8888', 120, leftY)
      doc.text('Email:', 50, leftY += 12, { continued: true })
          .text('info@yourcompany.com', 120, leftY)

      // Invoice Details (Right Side)
      let rightY = 85
      doc.text('Delivery Receipt No.', 400, rightY, { continued: true })
          .text('Customer Account', 480, rightY)
      doc.text(`DR-${invoiceData.invoiceNumber?.slice(-6) || '000001'}`, 400, rightY += 12, { continued: true })
          .text('ACC-000001', 480, rightY)

      doc.text('Sales Invoice No.', 400, rightY += 15, { continued: true })
          .text('Your Reference', 480, rightY)
      doc.text(invoiceData.invoiceNumber || 'INV-000001', 400, rightY += 12, { continued: true })
          .text(invoiceData.metadata?.projectCode || 'REF-001', 480, rightY)

      doc.text('Invoice Date', 400, rightY += 15, { continued: true })
          .text('Your Order Number', 480, rightY)
      doc.text(new Date().toLocaleDateString('en-GB'), 400, rightY += 12, { continued: true })
          .text('ORD-001', 480, rightY)

      doc.text('Our Contact', 400, rightY += 15)
      doc.text('Sales Department', 400, rightY += 12)
      doc.text('Payment Terms', 400, rightY += 12)
      doc.text('Net 30 Days', 400, rightY += 12)

      // Client Information Section
      let clientY = 220
      doc.fontSize(11)
          .fillColor('#000000')
          .text('Invoice Address', 50, clientY, { underline: true })
          .text('Delivery Address', 280, clientY, { underline: true })

      clientY += 15
      if (invoiceData.client) {
        // Invoice Address (Left)
        doc.fontSize(10)
            .text(invoiceData.client.name || 'Client Name', 50, clientY)
        if (invoiceData.client.taxId) {
          doc.text(`TIN: ${invoiceData.client.taxId}`, 50, clientY += 12)
        }
        if (invoiceData.client.address) {
          const addressLines = invoiceData.client.address.split('\n')
          addressLines.forEach(line => {
            doc.text(line, 50, clientY += 12)
          })
        }

        // Delivery Address (Right)
        doc.text(invoiceData.client.name || 'Client Name', 280, 235)
        if (invoiceData.client.address) {
          const addressLines = invoiceData.client.address.split('\n')
          addressLines.forEach((line, index) => {
            doc.text(line, 280, 247 + (index * 12))
          })
        }
      }

      // ==============================
      // Items Table (FIXED LAYOUT)
      // ==============================
      let tableY = 340

      // Define table columns
      const tableColumns = [
        { label: 'Item Number', x: 55, width: 60 },
        { label: 'Description', x: 120, width: 100 },
        { label: 'Tenant', x: 225, width: 60 },
        { label: 'From', x: 290, width: 40 },
        { label: 'To', x: 335, width: 40 },
        { label: 'Term', x: 380, width: 50 },
        { label: 'Unit Price', x: 435, width: 60, align: 'right' },
        { label: 'Quantity', x: 500, width: 50, align: 'right' },
        { label: 'VAT (%)', x: 555, width: 50, align: 'right' },
        { label: 'VAT', x: 610, width: 60, align: 'right' },
        { label: 'Amount', x: 675, width: 70, align: 'right' },
      ]

      // Table Header
      doc.rect(50, tableY, pageWidth - 100, 25).fill(lightGrayColor)
      doc.fontSize(9).fillColor('#000000')
      tableColumns.forEach(col => {
        doc.text(col.label, col.x, tableY + 8, { width: col.width, align: col.align || 'left' })
      })

      // Table Rows
      tableY += 25
      if (invoiceData.items && Array.isArray(invoiceData.items)) {
        invoiceData.items.forEach((item, index) => {
          const rowHeight = 20
          const y = tableY + (index * rowHeight)

          // Alternating row colors
          if (index % 2 === 1) {
            doc.rect(50, y, pageWidth - 100, rowHeight).fill('#fafafa')
          }

          const lineTotal = (item.qty || 0) * (item.unitPrice || 0)
          const taxRate = getTaxRate(item.taxCategory)
          const taxAmount = lineTotal * taxRate

          const rowValues = [
            `ITEM-${String(index + 1).padStart(3, '0')}`,
            item.description || 'Service',
            'CLIENT-001',
            new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
            new Date(Date.now() + 30*24*60*60*1000).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }),
            'Monthly',
            (item.unitPrice || 0).toFixed(2),
            String(item.qty || 0),
            (taxRate * 100).toFixed(0),
            taxAmount.toFixed(2),
            lineTotal.toFixed(2),
          ]

          rowValues.forEach((val, i) => {
            const col = tableColumns[i]
            doc.fillColor('#000000').text(val, col.x, y + 5, { width: col.width, align: col.align || 'left' })
          })
        })
      }

      // Calculate totals
      const calculations = calculateInvoiceTotals(invoiceData)

      // Add a separator line after the table
      const tableEndY = Math.max(350, tableY + (invoiceData.items?.length || 1) * 18 + 20)
      doc.moveTo(40, tableEndY).lineTo(pageWidth - 40, tableEndY).stroke('#e5e7eb')

      // Acknowledgement (bottom left)
      let footerY = tableEndY + 20
      doc.fontSize(9)
          .text('Acknowledgement certificate number:', 40, footerY, { continued: true })
          .text('AC_126_052025_000827', 200, footerY)
      doc.text('Date issued:', 40, footerY += 12, { continued: true })
          .text(new Date().toLocaleDateString('en-GB'), 200, footerY)
      doc.text('Range of Series Nos from:', 40, footerY += 12, { continued: true })
          .text('270300001 To 270399999', 200, footerY)

      // ==============================
      // Totals Section (Bottom Right)
      // ==============================
      let totalsX = 550
      let totalsY = tableEndY + 20
      const labelX = totalsX + 10
      const valueX = totalsX + 120
      const currency = invoiceData.currency || 'PHP'

      // Draw the box around the totals
      doc.rect(totalsX, totalsY, 200, 110).stroke('#e5e7eb')

      totalsY += 15

      // Std-rated Sales
      doc.fontSize(9).font('Helvetica')
          .text('Std-rated Sales:', labelX, totalsY)
          .text(`${calculations.subtotal.toFixed(2)} ${currency}`, valueX, totalsY, { align: 'right', width: 60 })

      // Exempt Sales
      doc.text('Exempt Sales:', labelX, totalsY += 12)
          .text(`0.00 ${currency}`, valueX, totalsY, { align: 'right', width: 60 })

      // Zero Rated Sales
      doc.text('Zero Rated Sales:', labelX, totalsY += 12)
          .text(`0.00 ${currency}`, valueX, totalsY, { align: 'right', width: 60 })

      // Total Sales
      doc.text('Total Sales:', labelX, totalsY += 12)
          .text(`${calculations.subtotal.toFixed(2)} ${currency}`, valueX, totalsY, { align: 'right', width: 60 })

      // Add VAT
      doc.text('Add VAT:', labelX, totalsY += 12)
          .text(`${calculations.totalTax.toFixed(2)} ${currency}`, valueX, totalsY, { align: 'right', width: 60 })

      // Less Withholding Tax
      doc.text('Less Withholding Tax:', labelX, totalsY += 12)
          .text(`0.00 ${currency}`, valueX, totalsY, { align: 'right', width: 60 })

      // Grand Total
      const grandTotalString = `Grand Total: ${calculations.finalTotal.toFixed(2)} ${currency}`
      doc.fontSize(10).font('Helvetica-Bold')
          .text(grandTotalString, labelX, totalsY += 15, { align: 'right', width: 170 })

      doc.end()
    } catch (err) {
      reject(err)
    }
  })
}

function getTaxRate(taxCategory) {
  const TAX_RATES = {
    standard: 0.21,
    reduced: 0.09,
    zero: 0.0,
  }
  return TAX_RATES[taxCategory] || TAX_RATES.standard
}

// ==============================
// Calculate totals (backend)
// ==============================
function calculateInvoiceTotals(invoiceData) {
  const TAX_RATES = {
    standard: 0.21,
    reduced: 0.09,
    zero: 0.0,
  };

  let subtotal = 0;
  let totalTax = 0;

  // Items
  invoiceData.items?.forEach((item) => {
    if (item.qty && item.unitPrice) {
      const lineTotal = item.qty * item.unitPrice;
      const taxRate = TAX_RATES[item.taxCategory] || TAX_RATES.standard;
      subtotal += lineTotal;
      totalTax += lineTotal * taxRate;
    }
  });

  // Markups
  let markupTotal = 0;
  invoiceData.markups?.forEach((markup) => {
    if (markup.value) {
      if (markup.type === "percentage") {
        markupTotal += subtotal * (markup.value / 100);
      } else if (markup.type === "amount") {
        markupTotal += Number(markup.value);
      }
    }
  });

  // Discounts
  let discountTotal = 0;
  invoiceData.discounts?.forEach((discount) => {
    if (discount.value) {
      if (discount.type === "percentage") {
        discountTotal += subtotal * (discount.value / 100);
      } else if (discount.type === "amount") {
        discountTotal += Number(discount.value);
      }
    }
  });

  // Apply markups/discounts before tax
  const adjustedSubtotal = subtotal + markupTotal - discountTotal;

  // Final total = adjusted subtotal + tax
  const finalTotal = adjustedSubtotal + totalTax;

  return {
    subtotal,
    markupTotal,
    discountTotal,
    totalTax,
    finalTotal,
  };
}


module.exports = async ({ req, res, log, error }) => {
  try {
    log("Raw body:", req.body)
    const payload = JSON.parse(req.body || "{}")
    log("Parsed payload:", payload)

    if (!payload.client || !payload.items) {
      return res.json({ success: false, error: "Missing required fields" }, 400)
    }

    log("Generating PDF...")
    const pdfBuffer = await generateInvoicePDF(payload)

    return res.json({
      success: true,
      message: "Invoice generated successfully",
      invoiceNumber: payload.invoiceNumber || `INV-${Date.now()}`,
      pdfBase64: pdfBuffer.toString("base64"),
    })
  } catch (err) {
    error("Invoice generation failed:", err)
    return res.json({ success: false, error: err.message || "Unknown error" }, 500)
  }
}