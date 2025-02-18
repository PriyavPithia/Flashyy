// Declare the global pdfjsLib type
declare const pdfjsLib: any;

export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    console.log('Starting PDF extraction...', {
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)}MB`
    });

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    console.log(`PDF loaded. Total pages detected: ${pdf.numPages}`);
    let fullText = '';

    // Extract text from each page
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i} of ${pdf.numPages}...`);
      const page = await pdf.getPage(i);
      
      // Get page dimensions
      const viewport = page.getViewport({ scale: 1.0 });
      console.log(`Page ${i} dimensions:`, {
        width: viewport.width,
        height: viewport.height
      });

      const content = await page.getTextContent();
      console.log(`Page ${i} content items:`, content.items.length);
      
      const text = content.items
        .map((item: any) => item.str)
        .join(' ');
      
      console.log(`Page ${i} extracted text length: ${text.length} characters`);
      if (text.length < 100) {  // Warning for suspiciously short text
        console.warn(`Warning: Page ${i} has very little text. Might be an image or scanned page.`);
      }
      
      fullText += `Page ${i}:\n${text}\n\n`;
    }

    console.log('Extraction complete. Summary:', {
      totalPages: pdf.numPages,
      totalTextLength: fullText.length,
      averageCharsPerPage: Math.round(fullText.length / pdf.numPages)
    });

    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

export function parseFlashcards(text: string): { question: string; answer: string }[] {
  console.log('Parsing flashcards from text:', text);
  const cards = [];
  const lines = text.split('\n');
  let currentQuestion = '';
  let currentAnswer = '';
  
  for (const line of lines) {
    if (line.startsWith('Q:')) {
      if (currentQuestion && currentAnswer) {
        cards.push({ question: currentQuestion, answer: currentAnswer });
        console.log('Added card:', { question: currentQuestion, answer: currentAnswer });
      }
      currentQuestion = line.substring(2).trim();
      currentAnswer = '';
    } else if (line.startsWith('A:')) {
      currentAnswer = line.substring(2).trim();
    }
  }
  
  if (currentQuestion && currentAnswer) {
    cards.push({ question: currentQuestion, answer: currentAnswer });
    console.log('Added final card:', { question: currentQuestion, answer: currentAnswer });
  }
  
  console.log('Final parsed cards:', cards);
  return cards;
} 