export interface VCardData {
  fullName: string;
  designation?: string;
  companyName?: string;
  phone?: string;
  email?: string;
  website?: string;
  address?: string;
  note?: string;
  avatarUrl?: string;
}

/**
 * Builds a standard vCard 3.0 string from contact details.
 */
export function generateVCardString(data: VCardData): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN;CHARSET=UTF-8:${(data.fullName || 'Contact').trim()}`,
  ];

  if (data.designation) {
    lines.push(`TITLE;CHARSET=UTF-8:${data.designation.trim()}`);
  }

  if (data.companyName) {
    lines.push(`ORG;CHARSET=UTF-8:${data.companyName.trim()}`);
  }

  if (data.phone) {
    const cleanPhone = data.phone.replace(/^tel:\s*/i, '').trim();
    lines.push(`TEL;TYPE=CELL,VOICE;CHARSET=UTF-8:${cleanPhone}`);
  }

  if (data.email) {
    const cleanEmail = data.email.replace(/^mailto:\s*/i, '').trim();
    lines.push(`EMAIL;TYPE=INTERNET,WORK;CHARSET=UTF-8:${cleanEmail}`);
  }

  if (data.website) {
    lines.push(`URL;CHARSET=UTF-8:${data.website.trim()}`);
  }

  if (data.address) {
    // Format: ADR;TYPE=WORK:;;Street;City;State;PostalCode;Country
    lines.push(`ADR;TYPE=WORK;CHARSET=UTF-8:;;${data.address.trim()};;;;`);
  }

  if (data.note) {
    lines.push(`NOTE;CHARSET=UTF-8:${data.note.replace(/\r?\n/g, '\\n').trim()}`);
  }

  if (data.avatarUrl) {
    lines.push(`PHOTO;VALUE=URI:${data.avatarUrl}`);
  }

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

/**
 * Client-side helper to trigger an instant .vcf file download.
 * On mobile iOS / Android, tapping this directly opens the contacts app with the new contact pre-filled.
 */
export function downloadVCard(data: VCardData, filename = 'contact.vcf') {
  if (typeof window === 'undefined') return;

  const vCardContent = generateVCardString(data);
  const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
}
