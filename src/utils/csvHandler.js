/**
 * CSV Import/Export Utilities
 * Handle CSV file operations for transaction data
 */

const CSV_DELIMITER = ',';
const CSV_NEWLINE = '\n';

/**
 * Escape a CSV field value
 * @param {string} value - Raw field value
 * @returns {string} Escaped CSV field
 */
const escapeField = (value) => {
  const str = String(value ?? '');
  if (str.includes(CSV_DELIMITER) || str.includes('"') || str.includes(CSV_NEWLINE)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

/**
 * Parse a CSV line into fields
 * @param {string} line - CSV line
 * @returns {string[]} Array of field values
 */
const parseLine = (line) => {
  const fields = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === CSV_DELIMITER) {
        fields.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
  }
  fields.push(current.trim());
  return fields;
};

/**
 * CSV column headers for transaction export
 */
export const CSV_HEADERS = [
  'Date',
  'Type',
  'Category',
  'Amount',
  'Description',
  'Payment Method',
  'Tags',
  'Is Recurring',
  'Recurring Frequency',
];

/**
 * Convert transactions array to CSV string
 * @param {Array} transactions - Array of transaction objects
 * @returns {string} CSV formatted string
 */
export const exportToCSV = (transactions) => {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return CSV_HEADERS.join(CSV_DELIMITER);
  }

  const lines = [CSV_HEADERS.join(CSV_DELIMITER)];

  transactions.forEach((t) => {
    const row = [
      t.date || '',
      t.type || '',
      t.category || '',
      t.amount || '0',
      t.description || '',
      t.paymentMethod || '',
      Array.isArray(t.tags) ? t.tags.join(';') : (t.tags || ''),
      t.isRecurring ? 'Yes' : 'No',
      t.recurringFrequency || '',
    ].map(escapeField);
    lines.push(row.join(CSV_DELIMITER));
  });

  return lines.join(CSV_NEWLINE);
};

/**
 * Parse CSV string into transaction objects
 * @param {string} csvText - Raw CSV text
 * @returns {Object} {transactions, errors}
 */
export const importFromCSV = (csvText) => {
  if (!csvText || typeof csvText !== 'string') {
    return { transactions: [], errors: ['No CSV data provided'] };
  }

  const lines = csvText.split(CSV_NEWLINE).filter((line) => line.trim());
  if (lines.length === 0) {
    return { transactions: [], errors: ['Empty CSV file'] };
  }

  const headers = parseLine(lines[0]).map((h) => h.toLowerCase().trim());
  const expectedHeaders = ['date', 'type', 'category', 'amount', 'description'];

  const hasRequiredHeaders = expectedHeaders.every((h) =>
    headers.includes(h)
  );
  if (!hasRequiredHeaders) {
    return {
      transactions: [],
      errors: [`CSV headers must include: ${expectedHeaders.join(', ')}`],
    };
  }

  const getFieldIndex = (name) => headers.indexOf(name.toLowerCase());
  const dateIdx = getFieldIndex('date');
  const typeIdx = getFieldIndex('type');
  const categoryIdx = getFieldIndex('category');
  const amountIdx = getFieldIndex('amount');
  const descIdx = getFieldIndex('description');
  const paymentIdx = getFieldIndex('payment method');
  const tagsIdx = getFieldIndex('tags');
  const recurringIdx = getFieldIndex('is recurring');
  const freqIdx = getFieldIndex('recurring frequency');

  const transactions = [];
  const errors = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = parseLine(lines[i]);
    if (fields.length < 5) {
      errors.push(`Line ${i + 1}: Insufficient columns`);
      continue;
    }

    const amount = parseFloat(fields[amountIdx]);
    if (isNaN(amount) || amount <= 0) {
      errors.push(`Line ${i + 1}: Invalid amount "${fields[amountIdx]}"`);
      continue;
    }

    const type = fields[typeIdx]?.toLowerCase();
    if (!['income', 'expense'].includes(type)) {
      errors.push(`Line ${i + 1}: Invalid type "${fields[typeIdx]}"`);
      continue;
    }

    const date = fields[dateIdx];
    if (!date || isNaN(new Date(date).getTime())) {
      errors.push(`Line ${i + 1}: Invalid date "${date}"`);
      continue;
    }

    const transaction = {
      id: `csv_${Date.now()}_${i}`,
      date: new Date(date).toISOString().split('T')[0],
      type,
      category: fields[categoryIdx] || 'Uncategorized',
      amount,
      description: fields[descIdx] || '',
      paymentMethod: paymentIdx >= 0 ? fields[paymentIdx] : '',
      tags: tagsIdx >= 0 && fields[tagsIdx]
        ? fields[tagsIdx].split(';').map((t) => t.trim()).filter(Boolean)
        : [],
      isRecurring: recurringIdx >= 0
        ? fields[recurringIdx]?.toLowerCase() === 'yes'
        : false,
      recurringFrequency: freqIdx >= 0 ? fields[freqIdx] : '',
      createdAt: new Date().toISOString(),
    };

    transactions.push(transaction);
  }

  return { transactions, errors };
};

/**
 * Download CSV content as a file
 * @param {string} csvContent - CSV string content
 * @param {string} filename - Desired filename
 */
export const downloadCSV = (csvContent, filename = 'transactions.csv') => {
  if (!csvContent) return;

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Read a file as text
 * @param {File} file - File object from input
 * @returns {Promise<string>} File contents
 */
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'));
      return;
    }
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      reject(new Error('File must be a CSV'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Generate a CSV template for import
 * @returns {string} CSV template string
 */
export const generateCSVTemplate = () => {
  const headers = CSV_HEADERS.join(CSV_DELIMITER);
  const example = [
    '2024-01-15',
    'expense',
    'Food & Dining',
    '45.67',
    'Grocery shopping at Whole Foods',
    'Credit Card',
    'groceries;organic',
    'No',
    '',
  ].join(CSV_DELIMITER);
  return `${headers}\n${example}`;
};
