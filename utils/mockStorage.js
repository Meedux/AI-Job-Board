// Mock user storage for testing without Google Sheets
// In production, this would use the actual Google Sheets API

const mockUsers = [];
let userIdCounter = 1;

export const mockAddUserToSheet = async (spreadsheetId, userData) => {
  console.log('📊 Mock: Adding user to storage...');
  console.log('👤 User data:', { ...userData, hashedPassword: '[HIDDEN]' });
  
  // Simulate the user being added
  const user = {
    ...userData,
    uid: userData.uid || `user_${userIdCounter++}`
  };
  
  mockUsers.push(user);
  console.log('✅ Mock: User added successfully');
  console.log('📊 Mock: Total users now:', mockUsers.length);
  
  return { success: true };
};

export const mockGetUserByEmail = async (spreadsheetId, email) => {
  console.log('🔍 Mock: Getting user by email:', email);
  
  const user = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  if (user) {
    console.log('✅ Mock: User found:', { ...user, hashedPassword: '[HIDDEN]' });
    return user;
  } else {
    console.log('👤 Mock: User not found');
    return null;
  }
};

export const mockGetAllUsers = async (spreadsheetId) => {
  console.log('📊 Mock: Getting all users, count:', mockUsers.length);
  return mockUsers.map(user => ({ ...user, hashedPassword: '[HIDDEN]' }));
};
