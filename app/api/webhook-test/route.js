// Simple webhook test endpoint
export async function POST(request) {
  console.log('🔔 Webhook test endpoint called');
  
  try {
    const body = await request.text();
    console.log('📥 Webhook body:', body);
    
    const event = JSON.parse(body);
    console.log('📋 Parsed event:', event);
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('❌ Webhook test error:', error);
    return new Response('Error', { status: 500 });
  }
}
