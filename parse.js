// index.js
const express = require('express');
const Mercury = require('@postlight/mercury-parser');
const app = express();

app.use(express.json());

app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  try {
    const result = await Mercury.parse(url);
    res.json({
      title: result.title,
      content: result.content,
      excerpt: result.excerpt,
      date_published: result.date_published,
      lead_image_url: result.lead_image_url,
      source_url: result.url
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to scrape', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on port ${PORT}`);
});