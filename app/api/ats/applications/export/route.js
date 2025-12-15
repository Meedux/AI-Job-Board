import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { prisma } from '@/utils/db';
import { google } from 'googleapis';

const EXPORT_FIELDS = [
  'Candidate Name',
  'Email',
  'Phone',
  'Stage',
  'Status',
  'Priority',
  'Match Score',
  'Job Title',
  'Job Location',
  'Applied At',
  'Tags',
  'Notes'
];

function toCsv(rows) {
  if (rows.length === 0) {
    return `${EXPORT_FIELDS.join(',')}`;
  }
  const formatValue = value => {
    if (value === null || value === undefined) return '';
    const stringValue = Array.isArray(value) ? value.join('; ') : value.toString();
    const escaped = stringValue.replace(/"/g, '""');
    return `"${escaped}"`;
  };
  const data = rows.map(row => EXPORT_FIELDS.map(key => formatValue(row[key])).join(',')).join('\n');
  return `${EXPORT_FIELDS.join(',')}\n${data}`;
}

async function toExcelBuffer(rows) {
  const xlsx = await import('xlsx');
  const worksheet = xlsx.utils.json_to_sheet(rows);
  const workbook = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Candidates');
  return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

async function toPdfBuffer(rows) {
  const PDFDocument = (await import('pdfkit')).default;
  return await new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 36 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('ATS Candidate Export', { align: 'center' });
    doc.moveDown();

    rows.forEach((row, index) => {
      doc.fontSize(12).fillColor('#111827').text(`${index + 1}. ${row['Candidate Name'] || 'Unnamed Candidate'}`, { continued: false });
      doc.moveDown(0.25);
      doc.fontSize(10).fillColor('#374151');
      Object.entries(row).forEach(([key, value]) => {
        if (key === 'Candidate Name') return;
        const textValue = Array.isArray(value) ? value.join(', ') : value || '—';
        doc.text(`${key}: ${textValue}`);
      });
      if (index < rows.length - 1) {
        doc.moveDown();
        doc.moveTo(doc.x, doc.y).lineTo(doc.page.width - doc.page.margins.right, doc.y).stroke('#E5E7EB');
        doc.moveDown();
      }
    });

    doc.end();
  });
}

async function syncToGoogleSheets(rows) {
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    return { requiresSetup: true };
  }

  const auth = new google.auth.JWT(clientEmail, undefined, privateKey, [
    'https://www.googleapis.com/auth/spreadsheets'
  ]);

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheet = await sheets.spreadsheets.create({
    resource: {
      properties: { title: `ATS Export ${new Date().toISOString()}` }
    }
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheet.data.spreadsheetId,
    range: 'A1',
    valueInputOption: 'RAW',
    requestBody: {
      values: [EXPORT_FIELDS, ...rows.map(row => EXPORT_FIELDS.map(field => row[field] || ''))]
    }
  });

  return {
    sheetUrl: spreadsheet.data.spreadsheetUrl,
    spreadsheetId: spreadsheet.data.spreadsheetId
  };
}

function mapApplicationToRow(application) {
  return {
    'Candidate Name': application.applicant?.fullName || `${application.applicant?.firstName || ''} ${application.applicant?.lastName || ''}`.trim() || 'Unknown',
    Email: application.applicant?.email || 'Hidden',
    Phone: application.contactRevealed || application.contactVisible !== false ? (application.applicant?.phone || 'Not provided') : 'Hidden',
    Stage: application.stage,
    Status: application.status,
    Priority: application.priority,
    'Match Score': application.jobMatchScore ?? '',
    'Job Title': application.job?.title || '—',
    'Job Location': application.job?.location || '—',
    'Applied At': application.appliedAt ? new Date(application.appliedAt).toLocaleString() : '—',
    Tags: (application.tags || []).join(', '),
    Notes: application.notes || ''
  };
}

async function fetchApplications(user, ids) {
  const baseWhere = {
    id: { in: ids }
  };

  if (user.role !== 'super_admin') {
    baseWhere.job = {
      OR: [
        { postedById: user.id },
        { postedById: user.parentUserId || user.id },
        { postedBy: { parentUserId: user.parentUserId || user.id } }
      ]
    };
  }

  const applications = await prisma.jobApplication.findMany({
    where: baseWhere,
    include: {
      applicant: {
        select: {
          id: true,
          fullName: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true
        }
      },
      job: {
        select: {
          id: true,
          title: true,
          location: true
        }
      }
    }
  });

  return applications;
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationIds, format } = await request.json();

    if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
      return NextResponse.json({ error: 'Application IDs required' }, { status: 400 });
    }

    const applications = await fetchApplications(user, applicationIds);

    if (applications.length === 0) {
      return NextResponse.json({ error: 'No applications found for export' }, { status: 404 });
    }

    const rows = applications.map(mapApplicationToRow);

    switch (format) {
      case 'csv': {
        const csv = toCsv(rows);
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="ats-export-${Date.now()}.csv"`
          }
        });
      }
      case 'excel': {
        const buffer = await toExcelBuffer(rows);
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="ats-export-${Date.now()}.xlsx"`
          }
        });
      }
      case 'pdf': {
        const buffer = await toPdfBuffer(rows);
        return new NextResponse(buffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="ats-export-${Date.now()}.pdf"`
          }
        });
      }
      case 'google_sheets': {
        const result = await syncToGoogleSheets(rows);
        if (result.requiresSetup) {
          return NextResponse.json({
            success: false,
            requiresSetup: true,
            message: 'Google Sheets integration not configured. Provide GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_SERVICE_ACCOUNT_KEY env vars.',
            rows
          }, { status: 428 });
        }
        return NextResponse.json({
          success: true,
          sheetUrl: result.sheetUrl,
          spreadsheetId: result.spreadsheetId
        });
      }
      default:
        return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 });
    }
  } catch (error) {
    console.error('ATS export error:', error);
    return NextResponse.json({ error: 'Failed to export applications' }, { status: 500 });
  }
}
