// Test sub-user creation API
const testSubUserCreation = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        email: 'test-subuser@example.com',
        fullName: 'Test Sub User',
        password: 'testpassword123',
        role: 'sub_user',
        userType: 'staff',
        allocatedResumeCredits: 10,
        allocatedAiCredits: 5
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Sub-user creation successful');
    } else {
      console.log('❌ Sub-user creation failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// Test sub-user listing
const testSubUserList = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/admin/users', {
      credentials: 'include'
    });

    const data = await response.json();
    console.log('List response status:', response.status);
    console.log('List response data:', data);
    
    if (response.ok) {
      console.log('✅ Sub-user list successful');
      console.log('Users found:', data.users?.length || 0);
    } else {
      console.log('❌ Sub-user list failed:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

export { testSubUserCreation, testSubUserList };