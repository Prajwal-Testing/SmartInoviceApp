'use server';  // ← This tells TanStack Start this runs on server only

export async function fetchSubscriptionData() {
  try {
    // This fetch runs on the server, not the browser
    const response = await fetch('https://pastebin.com/raw/3VRBKyiq', {
      method: 'GET',
      headers: {
        'User-Agent': 'SmartInvoice/1.0',  // Some servers require this
      },
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const text = await response.text();
    const json = JSON.parse(text);
    
    return {
      sub: !!json.sub,
      expiry_date: String(json.expiry_date || ''),
    };
  } catch (error) {
    console.error('Subscription fetch error:', error);
    // Return denied state on error for security
    return {
      sub: false,
      expiry_date: new Date().toISOString(),
    };
  }
}
