export default function handler(req, res) {
  const vars = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
    OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'MISSING',
    UPSTASH_REDIS_REST_KV_REST_API_URL: process.env.UPSTASH_REDIS_REST_KV_REST_API_URL ? 'SET' : 'MISSING',
    UPSTASH_REDIS_REST_KV_REST_API_TOKEN: process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN ? 'SET' : 'MISSING',
    CHECKOUT_URL: process.env.CHECKOUT_URL ? 'SET' : 'MISSING',
  };

  // Also check common alternative names in case they're different
  const alternatives = {};
  const envKeys = Object.keys(process.env).filter(k =>
    k.includes('UPSTASH') || k.includes('REDIS') || k.includes('KV') || k.includes('GOOGLE')
  );
  envKeys.forEach(k => { alternatives[k] = 'EXISTS'; });

  return res.status(200).json({ vars, alternatives });
}
