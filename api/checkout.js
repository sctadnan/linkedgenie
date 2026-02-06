export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const checkoutUrl = process.env.CHECKOUT_URL;

  if (!checkoutUrl) {
    return res.status(500).json({ error: 'Checkout URL not configured' });
  }

  return res.redirect(302, checkoutUrl);
}
