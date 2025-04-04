const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');
const app = express();
const PORT = 5000;

// Configuración CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

// Servir imágenes estáticas
app.use('/imagenes', express.static(path.join(__dirname, 'client', 'public', 'imagenes')));

// Endpoint de artículos con paginación
app.get('/api/articulos', async (req, res) => {
  try {
    const dataPath = path.join(__dirname, 'data', 'articulos.json');
    const rawData = await fs.readFile(dataPath, 'utf8');
    let todosArticulos = JSON.parse(rawData);

    // Parámetro de búsqueda
    const searchQuery = req.query.search?.toLowerCase() || '';

    // Filtrar artículos si hay búsqueda
    if (searchQuery) {
      todosArticulos = todosArticulos.filter(articulo => 
        articulo.descripcion.toLowerCase().includes(searchQuery) ||
        articulo.codigo.toLowerCase().includes(searchQuery)
      );
    }

    // Parámetros de paginación
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    // Validación de parámetros
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      return res.status(400).json({ 
        error: 'Parámetros de paginación inválidos',
        ejemplo_valido: '/api/articulos?page=1&limit=20'
      });
    }

    // Preparar respuesta
    const resultados = todosArticulos.slice(startIndex, endIndex);
    const total = todosArticulos.length;

    res.json({
      articulos: resultados,
      total,
      page,
      totalPages: Math.ceil(total / limit),
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor activo en http://localhost:${PORT}`);
});