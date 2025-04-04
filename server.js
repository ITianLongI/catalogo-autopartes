const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5000;

// Configuración para producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));
} else {
  app.use(cors({ 
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
  }));
}

app.use(express.json());

// Endpoint de artículos
app.get('/api/articulos', async (req, res) => {
  try {
    const dataPath = process.env.NODE_ENV === 'production'
      ? path.join(__dirname, 'client/public/data/articulos.json')
      : path.join(__dirname, 'data/articulos.json');

    const rawData = await fs.readFile(dataPath, 'utf8');
    let todosArticulos = JSON.parse(rawData);

    const searchQuery = req.query.search?.toLowerCase() || '';
    if (searchQuery) {
      todosArticulos = todosArticulos.filter(articulo => 
        articulo.descripcion.toLowerCase().includes(searchQuery) ||
        articulo.codigo.toLowerCase().includes(searchQuery)
      );
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const resultados = todosArticulos.slice(startIndex, startIndex + limit);

    res.json({
      articulos: resultados,
      total: todosArticulos.length,
      page,
      totalPages: Math.ceil(todosArticulos.length / limit),
      itemsPerPage: limit
    });

  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      detalle: error.message
    });
  }
});

// Ruta para producción
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`✅ Servidor ${process.env.NODE_ENV || 'development'} en puerto ${PORT}`);
});