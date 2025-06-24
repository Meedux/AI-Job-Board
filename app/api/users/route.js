import { NextResponse } from 'next/server';
import { fetchSheetData } from '../../../utils/googleApi';

const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;

export async function GET(request) {
  try {
    // In a real application, this would be protected with admin authentication
    // For demo purposes, we'll allow access to view users
    
    const rows = await fetchSheetData(SPREADSHEET_ID, 'User!A:G');
    
    if (!rows || rows.length === 0) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    // Skip header row and convert to user objects
    const users = [];
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      if (row && row.length > 0) {
        users.push({
          uid: row[0] || '',
          fullName: row[1] || '',
          nickname: row[2] || '',
          email: row[3] || '',
          age: row[4] || '',
          dateOfBirth: row[5] || '',
          fullAddress: row[6] || ''
        });
      }
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
