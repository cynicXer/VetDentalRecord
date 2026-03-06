import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Hook for exporting the dental chart to a PDF.
 *
 * Usage:
 *   const { exportPDF, isExporting } = usePDFExport();
 *   <button onClick={() => exportPDF(patientInfo)}>Export PDF</button>
 *
 * The element with id="chart-export-root" is captured.
 * The class "pdf-capture-mode" is added before capture and removed after —
 * CSS hides toolbar, panel, and any edit-only controls during capture.
 */
export function usePDFExport() {
  const exportPDF = useCallback(async (patientInfo) => {
    const root = document.getElementById('chart-export-root');
    if (!root) {
      console.error('usePDFExport: #chart-export-root not found');
      return;
    }

    // Enter capture mode (hides toolbar/panel via CSS)
    root.classList.add('pdf-capture-mode');
    // Also add to body for global overrides (e.g. hiding the slide-in panel backdrop)
    document.body.classList.add('pdf-capture-mode');

    try {
      const canvas = await html2canvas(root, {
        scale: 2,
        backgroundColor: '#FFFFFF',
        windowWidth: 1200,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');

      // Landscape Letter: 279.4mm × 215.9mm
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'letter',
      });

      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const availW = pageW - 2 * margin;
      const availH = pageH - 2 * margin;

      const imgW = canvas.width;
      const imgH = canvas.height;
      const scale = Math.min(availW / imgW, availH / imgH);

      const drawW = imgW * scale;
      const drawH = imgH * scale;
      const offsetX = margin + (availW - drawW) / 2;
      const offsetY = margin + (availH - drawH) / 2;

      pdf.addImage(imgData, 'PNG', offsetX, offsetY, drawW, drawH);

      // Build filename: OwnerLastName_PetName_YYYY-MM-DD.pdf
      const safeOwner = (patientInfo?.ownerLastName || 'Owner').replace(/[^a-z0-9]/gi, '_');
      const safePet   = (patientInfo?.petName || 'Pet').replace(/[^a-z0-9]/gi, '_');
      const date      = patientInfo?.date || new Date().toISOString().split('T')[0];
      pdf.save(`${safeOwner}_${safePet}_${date}.pdf`);

    } finally {
      root.classList.remove('pdf-capture-mode');
      document.body.classList.remove('pdf-capture-mode');
    }
  }, []);

  return { exportPDF };
}
