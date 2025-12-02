// Utilidades para impresión de reportes

import { IVA_PERCENTAGE } from '../constants';

/**
 * Genera el HTML para imprimir reporte de un técnico
 */
export const generateTechnicianReportHTML = (techName, details, dateRange) => {
    let html = `
        <html>
        <head>
            <title>Reporte de Comisión - ${techName}</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; font-size: 12px; }
                h1 { text-align: center; color: #1a365d; border-bottom: 2px solid #0891b2; padding-bottom: 10px; font-size: 18px; }
                h2 { color: #0891b2; margin-top: 20px; font-size: 14px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; font-size: 11px; }
                th { background-color: #f0f9ff; font-weight: 600; }
                .summary { margin-top: 15px; font-size: 13px; font-weight: bold; background-color: #fff7ed; padding: 12px; border-radius: 6px; border: 1px solid #fed7aa; }
                .meta { color: #666; font-size: 11px; margin-bottom: 15px; }
            </style>
        </head>
        <body>
            <h1>Reporte de Comisiones - ${techName}</h1>
            <p class="meta">Período: ${dateRange.start} al ${dateRange.end} | Generado: ${new Date().toLocaleString('es-CL')}</p>
            <table>
                <thead>
                    <tr>
                        <th>Fecha</th><th>N° Orden</th><th>Cliente</th><th>Bruto</th>
                        <th>Neto</th><th>Repuestos</th><th>Base</th><th>%</th><th>Comisión</th>
                    </tr>
                </thead>
                <tbody>
    `;

    let totalCommission = 0;
    let totalBruto = 0;

    details.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(order => {
        const netCost = order.rawCost / (1 + IVA_PERCENTAGE);
        const commissionableBase = Math.max(0, netCost - order.materialsCost);
        totalCommission += order.commissionValue;
        totalBruto += order.rawCost;

        html += `
            <tr>
                <td>${order.date}</td>
                <td>${order.workOrderNumber}</td>
                <td>${order.clientName}</td>
                <td>$${order.rawCost.toLocaleString('es-CL')}</td>
                <td>$${Math.round(netCost).toLocaleString('es-CL')}</td>
                <td>$${order.materialsCost.toLocaleString('es-CL')}</td>
                <td>$${Math.round(commissionableBase).toLocaleString('es-CL')}</td>
                <td>${(order.commissionRate * 100).toFixed(0)}%</td>
                <td><strong>$${order.commissionValue.toLocaleString('es-CL')}</strong></td>
            </tr>
        `;
    });

    html += `
                </tbody>
            </table>
            <div class="summary">
                <p>Total Facturado: $${totalBruto.toLocaleString('es-CL')} | Total Órdenes: ${details.length}</p>
                <p style="font-size: 16px; margin-top: 8px;">TOTAL COMISIÓN: $${totalCommission.toLocaleString('es-CL')}</p>
            </div>
        </body>
        </html>
    `;

    return html;
};

/**
 * Genera el HTML para imprimir reporte general
 */
export const generateGeneralReportHTML = (groupedReports, dateRange, totalCommission) => {
    let html = `
        <html>
        <head>
            <title>Reporte General de Comisiones</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 20px; font-size: 12px; }
                h1 { text-align: center; color: #1a365d; border-bottom: 2px solid #0891b2; padding-bottom: 10px; font-size: 18px; }
                h2 { color: #0891b2; margin-top: 25px; font-size: 14px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 10px; margin-bottom: 20px; }
                th, td { border: 1px solid #ddd; padding: 5px 6px; text-align: left; font-size: 10px; }
                th { background-color: #f0f9ff; font-weight: 600; }
                .summary { font-size: 12px; font-weight: bold; background-color: #fff7ed; padding: 10px; border-radius: 6px; border: 1px solid #fed7aa; margin-top: 10px; }
                .total-general { font-size: 16px; font-weight: bold; background-color: #0891b2; color: white; padding: 15px; border-radius: 6px; margin-top: 20px; text-align: center; }
                .meta { color: #666; font-size: 11px; margin-bottom: 15px; }
            </style>
        </head>
        <body>
            <h1>Reporte General de Comisiones</h1>
            <p class="meta">Período: ${dateRange.start} al ${dateRange.end} | Generado: ${new Date().toLocaleString('es-CL')}</p>
    `;

    Object.entries(groupedReports).forEach(([techName, report]) => {
        html += `<h2>${techName} (${report.totalOrders} órdenes)</h2>`;
        html += `
            <table>
                <thead>
                    <tr><th>Fecha</th><th>Orden</th><th>Cliente</th><th>Bruto</th><th>Comisión</th></tr>
                </thead>
                <tbody>
        `;
        
        report.details.sort((a, b) => new Date(a.date) - new Date(b.date)).forEach(order => {
            html += `
                <tr>
                    <td>${order.date}</td>
                    <td>${order.workOrderNumber}</td>
                    <td>${order.clientName}</td>
                    <td>$${order.rawCost.toLocaleString('es-CL')}</td>
                    <td><strong>$${order.commissionValue.toLocaleString('es-CL')}</strong></td>
                </tr>
            `;
        });
        
        html += `</tbody></table>`;
        html += `<div class="summary">Subtotal ${techName}: $${report.totalCommission.toLocaleString('es-CL')}</div>`;
    });

    html += `
            <div class="total-general">TOTAL GENERAL: $${totalCommission.toLocaleString('es-CL')}</div>
        </body>
        </html>
    `;

    return html;
};

/**
 * Abre ventana de impresión con el HTML proporcionado
 */
export const openPrintWindow = (html) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
};

/**
 * Imprime reporte de un técnico
 */
export const printTechnicianReport = (techName, details, dateRange) => {
    const html = generateTechnicianReportHTML(techName, details, dateRange);
    openPrintWindow(html);
};

/**
 * Imprime reporte general
 */
export const printGeneralReport = (groupedReports, dateRange, totalCommission) => {
    const html = generateGeneralReportHTML(groupedReports, dateRange, totalCommission);
    openPrintWindow(html);
};
