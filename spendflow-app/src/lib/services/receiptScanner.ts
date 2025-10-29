/**
 * Receipt Scanner Service
 * Extracts transaction data from receipt images using OCR
 */

interface ReceiptData {
  amount?: number;
  merchant?: string;  // Company/store name
  date?: string;
  category?: string;  // Auto-detected category
  rawText: string;
}

export const receiptScannerService = {
  /**
   * Scan a receipt image and extract transaction data
   * Uses browser's built-in OCR or falls back to pattern matching
   */
  async scanReceipt(imageFile: File): Promise<ReceiptData> {
    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      // Try to use Tesseract.js for OCR (if available)
      // For now, we'll use a simpler approach with pattern matching
      const text = await this.extractTextFromImage(base64Image);
      
      // Parse the extracted text
      const data = this.parseReceiptText(text);
      
      // Auto-detect category
      data.category = this.detectCategory(text, data.merchant);
      
      return data;
    } catch (error) {
      console.error('Error scanning receipt:', error);
      throw new Error('Failed to scan receipt');
    }
  },

  /**
   * Convert file to base64 string
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Extract text from image using Tesseract.js OCR
   */
  async extractTextFromImage(base64Image: string): Promise<string> {
    try {
      // Dynamically import Tesseract to avoid SSR issues
      const Tesseract = await import('tesseract.js');
      
      const { data: { text } } = await Tesseract.recognize(
        base64Image,
        'eng',
        {
          logger: (m) => console.log(m), // Progress logger
        }
      );
      
      return text;
    } catch (error) {
      console.error('OCR Error:', error);
      // Fallback to empty string if OCR fails
      return '';
    }
  },

  /**
   * Parse receipt text to extract structured data
   */
  parseReceiptText(text: string): ReceiptData {
    const data: ReceiptData = {
      rawText: text,
    };

    // Extract amount (looks for patterns like $12.34, 12.34, etc.)
    const amountPatterns = [
      /\$?\s*(\d+\.\d{2})\s*(?:total|amount|sum|balance)/i,
      /(?:total|amount|sum|balance)\s*:?\s*\$?\s*(\d+\.\d{2})/i,
      /\$\s*(\d+\.\d{2})/g,
    ];

    for (const pattern of amountPatterns) {
      const match = text.match(pattern);
      if (match) {
        const amount = parseFloat(match[1] || match[0].replace(/[^0-9.]/g, ''));
        if (!isNaN(amount) && amount > 0) {
          data.amount = amount;
          break;
        }
      }
    }

    // Extract date (looks for various date formats)
    const datePatterns = [
      /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})/,
      /(\d{4}[-/]\d{1,2}[-/]\d{1,2})/,
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+\d{1,2},?\s+\d{4}/i,
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{4})/i,
    ];

    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        // Try to parse and convert to YYYY-MM-DD format
        const parsedDate = this.parseDate(match[0]);
        if (parsedDate) {
          data.date = parsedDate;
          break;
        }
      }
    }

    // Extract merchant name (usually at the top of receipt)
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length > 0) {
      // First non-empty line is usually the merchant
      data.merchant = lines[0].trim();
    }

    return data;
  },

  /**
   * Validate extracted data
   */
  validateReceiptData(data: ReceiptData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.amount || data.amount <= 0) {
      errors.push('Could not detect a valid amount');
    }

    if (!data.merchant || data.merchant.length < 2) {
      errors.push('Could not detect merchant name');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Parse date string and convert to YYYY-MM-DD format
   */
  parseDate(dateStr: string): string | null {
    try {
      // Try to parse the date
      const date = new Date(dateStr);
      
      // Check if valid date
      if (isNaN(date.getTime())) {
        return null;
      }
      
      // Convert to YYYY-MM-DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      return null;
    }
  },

  /**
   * Auto-detect category based on merchant name and receipt text
   */
  detectCategory(text: string, merchant?: string): string {
    const lowerText = text.toLowerCase();
    const lowerMerchant = (merchant || '').toLowerCase();
    const combined = `${lowerText} ${lowerMerchant}`;

    // Category keywords mapping
    const categories: { [key: string]: string[] } = {
      'Transport': ['petrol', 'gas', 'fuel', 'shell', 'bp', 'esso', 'texaco', 'chevron', 'uber', 'lyft', 'taxi', 'parking'],
      'Groceries': ['grocery', 'supermarket', 'tesco', 'sainsbury', 'asda', 'waitrose', 'aldi', 'lidl', 'milk', 'bread', 'food mart', 'market'],
      'Dining': ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonald', 'burger', 'pizza', 'kfc', 'subway', 'dining', 'bistro', 'grill'],
      'Shopping': ['store', 'shop', 'retail', 'amazon', 'ebay', 'clothing', 'fashion', 'nike', 'adidas', 'zara', 'h&m'],
      'Entertainment': ['cinema', 'movie', 'theater', 'netflix', 'spotify', 'game', 'entertainment', 'ticket'],
      'Healthcare': ['pharmacy', 'medical', 'doctor', 'hospital', 'clinic', 'health', 'boots', 'cvs', 'walgreens'],
      'Utilities': ['electric', 'water', 'gas bill', 'internet', 'phone bill', 'utility'],
      'Other': []
    };

    // Check each category for matching keywords
    for (const [category, keywords] of Object.entries(categories)) {
      for (const keyword of keywords) {
        if (combined.includes(keyword)) {
          return category;
        }
      }
    }

    // Default category
    return 'Other';
  },
};
