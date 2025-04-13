import express from 'express';
import axios from 'axios';
import cors from 'cors';
import multer from 'multer';

const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

const SHOPIFY_DOMAIN = 'tdih5u-ie.myshopify.com';
const ADMIN_TOKEN = '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'; // Reemplaza esto con tu token real

const classifyPH = (ph) => {
  if (ph < 5.1) return 'Muy ácido';
  if (ph <= 5.5) return 'Ácido ideal';
  if (ph <= 6.0) return 'Ligeramente ácido';
  return 'Neutro o alcalino';
};

const matchProductToPH = (body, ph) => {
  const desc = body.toLowerCase();
  if (ph < 5.1) return desc.includes('citrus') || desc.includes('fresh');
  if (ph <= 5.5) return true;
  if (ph <= 6.0) return desc.includes('amber') || desc.includes('musk');
  return desc.includes('oud') || desc.includes('patchouli');
};

const extractNotes = (bodyHtml) => {
  const text = bodyHtml.replace(/<[^>]*>/g, '\n');
  const notes = { head: '', heart: '', base: '' };
  const lines = text.split('\n');
  for (let line of lines) {
    if (line.includes('Head Notes:')) notes.head = line.split('Head Notes:')[1]?.trim() || '';
    if (line.includes('Heart Notes:')) notes.heart = line.split('Heart Notes:')[1]?.trim() || '';
    if (line.includes('Base Notes:')) notes.base = line.split('Base Notes:')[1]?.trim() || '';
  }
  return notes;
};

app.post('/api/recommendations', async (req, res) => {
  try {
    const { ph = 5.3 } = req.body;
    const endpoint = `https://${SHOPIFY_DOMAIN}/admin/api/2023-10/products.json?limit=50`;

    const response = await axios.get(endpoint, {
      headers: {
        'X-Shopify-Access-Token': ADMIN_TOKEN,
        'Content-Type': 'application/json',
      }
    });

    const results = [];
    for (let product of response.data.products) {
      const body = product.body_html || '';
      const inStock = product.variants?.some(v => v.inventory_quantity > 0);
      if (!inStock) continue;

      const matches = matchProductToPH(body, ph);
      if (matches) {
        results.push({
          title: product.title,
          notes: extractNotes(body),
          image: product.image?.src,
          url: `https://${SHOPIFY_DOMAIN}/products/${product.handle}`
        });
        if (results.length === 3) break;
      }
    }

    res.json({
      ph,
      clasificacion: classifyPH(ph),
      perfumes: results
    });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Error procesando la solicitud' });
  }
});

// Nueva ruta para análisis de piel desde imagen
app.post('/api/skin-analysis', upload.single('photo'), async (req, res) => {
  try {
    const imageBuffer = req.file.buffer;

    // 🔬 Simulación de análisis (IA se puede agregar luego)
    const simulatedResult = {
      skin_type: 'Grasa',
      analysis: 'Brillo visible en frente y nariz',
      recommendation: 'Perfumes frescos o cítricos ayudan a equilibrar la oleosidad'
    };

    return res.json(simulatedResult);
  } catch (error) {
    console.error('Error en análisis de piel:', error);
    res.status(500).json({ error: 'No se pudo analizar la imagen' });
  }
});

app.get('/', (req, res) => res.send('PH Recommender activo.'));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Servidor activo en puerto ${port}`));
