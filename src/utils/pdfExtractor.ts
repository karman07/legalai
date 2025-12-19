// PDF text extraction utility
// Install: npm install pdfjs-dist

export async function extractTextFromPDF(url: string): Promise<string> {
  try {
    // Dynamic import to avoid build issues
    const pdfjsLib = await import('pdfjs-dist');
    
    // Set worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const pdf = await pdfjsLib.getDocument(url).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += `\n\n--- Page ${i} ---\n\n${pageText}`;
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF extraction failed:', error);
    return '';
  }
}
