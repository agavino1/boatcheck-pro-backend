import { v4 as uuidv4 } from 'uuid';

export const generateInvoice = async (payment, invoiceNumber) => {
  // In a real application, you would generate a PDF and store it
  // For now, we'll return a placeholder URL
  
  const invoiceData = {
    invoiceNumber,
    date: new Date().toISOString(),
    paymentId: payment.id,
    amount: payment.amount,
    currency: payment.currency,
    status: payment.status,
  };

  // Simulate storing invoice and returning URL
  const invoiceId = uuidv4();
  const invoiceUrl = `${process.env.API_URL}/invoices/${invoiceId}`;

  // In production, you would:
  // 1. Generate PDF using a library like pdfkit or puppeteer
  // 2. Store it in cloud storage (S3, Google Cloud, etc.)
  // 3. Return the URL to the stored document

  return invoiceUrl;
};

export const getInvoiceData = (payment, user, inspection) => {
  return {
    invoiceNumber: payment.invoiceNumber,
    invoiceDate: payment.createdAt,
    paymentDate: payment.paidAt,
    
    // Client info
    clientName: `${user.firstName} ${user.lastName}`,
    clientEmail: user.email,
    clientPhone: user.phone,
    clientAddress: `${user.address}, ${user.city}, ${user.state} ${user.zipCode}`,
    
    // Company info
    companyName: 'BoatCheckPro',
    companyEmail: process.env.ADMIN_EMAIL,
    companyWebsite: process.env.FRONTEND_URL,
    
    // Inspection details
    description: `${inspection.inspectionType} Inspection - ${inspection.boatName}`,
    inspectionType: inspection.inspectionType,
    boatName: inspection.boatName,
    boatModel: inspection.boatModel,
    boatYear: inspection.boatYear,
    
    // Payment details
    amount: payment.amount,
    currency: payment.currency,
    paymentMethod: payment.paymentMethod,
    paymentStatus: payment.status,
    
    // Additional info
    notes: `Inspection completed on ${new Date(inspection.completedDate).toLocaleDateString()}`,
  };
};

export const formatInvoiceHTML = (invoiceData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; }
        .invoice-container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .company-info h1 { margin: 0; }
        .invoice-info { text-align: right; }
        .invoice-info p { margin: 5px 0; }
        .client-info { margin: 20px 0; }
        .client-info h3 { margin: 0; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .table th { background-color: #f0f0f0; padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .table td { padding: 10px; border-bottom: 1px solid #ddd; }
        .total-row { font-weight: bold; font-size: 18px; }
        .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <div class="company-info">
            <h1>${invoiceData.companyName}</h1>
            <p>${invoiceData.companyEmail}</p>
            <p>${invoiceData.companyWebsite}</p>
          </div>
          <div class="invoice-info">
            <h3>INVOICE</h3>
            <p><strong>#${invoiceData.invoiceNumber}</strong></p>
            <p>Date: ${new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
            <p>Paid: ${new Date(invoiceData.paymentDate).toLocaleDateString()}</p>
          </div>
        </div>

        <div class="client-info">
          <h3>Bill To:</h3>
          <p>${invoiceData.clientName}</p>
          <p>${invoiceData.clientEmail}</p>
          <p>${invoiceData.clientPhone}</p>
          <p>${invoiceData.clientAddress}</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${invoiceData.description}</td>
              <td>$${invoiceData.amount.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td>Total:</td>
              <td>$${invoiceData.amount.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

        <p><strong>Payment Status:</strong> ${invoiceData.paymentStatus}</p>
        <p><strong>Payment Method:</strong> ${invoiceData.paymentMethod}</p>

        <div class="footer">
          <p>Thank you for using BoatCheckPro Services</p>
          <p>This invoice is paid and should be retained for your records.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};
