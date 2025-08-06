import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.query;
  if (!url || typeof url !== 'string') return res.status(400).send('Missing url');

  https.get(url, { rejectUnauthorized: false }, (response) => {
    res.setHeader('Content-Type', response.headers['content-type'] || 'image/jpeg');
    response.pipe(res);
  }).on('error', (err) => {
    console.error(err);
    res.status(500).send('Image fetch failed');
  });
}