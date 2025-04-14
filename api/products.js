// /api/products.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const shop = 'tdih5u-ie.myshopify.com';
    const accessToken = process.env.SHOPIFY_API_TOKEN;

    const response = await fetch(`https://${shop}/admin/api/2023-04/products.json?status=active`, {
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    // Extraer perfumes relevantes con notas olfativas
    const perfumes = data.products.map(product => {
      const html = product.body_html;

      const extractNote = (label) => {
        const match = html.match(new RegExp(`${label}:\\s*(.*?)<`, 'i'));
        return match ? match[1].split(',').map(n => n.trim()) : [];
      };

      return {
        id: product.id,
        title: product.title,
        available: product.variants.some(v => v.available),
        type: product.product_type,
        notes: [
          ...extractNote('Head Notes'),
          ...extractNote('Heart Notes'),
          ...extractNote('Base Notes'),
        ],
        image: product.image?.src || null,
        handle: product.handle,
        url: `https://${shop}/products/${product.handle}`,
      };
    }).filter(p => p.available); // Solo perfumes disponibles

    res.status(200).json(perfumes);
  } catch (err) {
    console.error('Error al obtener productos:', err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
}
