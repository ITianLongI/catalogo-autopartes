import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ListaArticulos.css';
import { useNavigate } from 'react-router-dom';

const ListaArticulos = ({ carrito, añadirAlCarrito }) => {
  const navigate = useNavigate();
  const [articulos, setArticulos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [timeoutId, setTimeoutId] = useState(null);
  const itemsPerPage = 20;

  const handleSearch = (text) => {
    setSearchTerm(text);
    clearTimeout(timeoutId);
    const newTimeoutId = setTimeout(() => setCurrentPage(1), 500);
    setTimeoutId(newTimeoutId);
  };

  useEffect(() => {
    const cargarArticulos = async () => {
      try {
        const isProduction = process.env.NODE_ENV === 'production';
        const baseURL = isProduction 
          ? '/data/articulos.json' 
          : 'http://localhost:5000/api/articulos';

        let response;
        
        if (isProduction) {
          response = await axios.get(baseURL);
          const allItems = response.data;
          const filtered = allItems.filter(item => 
            item.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.codigo.toLowerCase().includes(searchTerm.toLowerCase())
          );
          const start = (currentPage - 1) * itemsPerPage;
          const end = start + itemsPerPage;
          const paginated = filtered.slice(start, end);

          setArticulos(paginated);
          setTotalPages(Math.ceil(filtered.length / itemsPerPage));
        } else {
          response = await axios.get(baseURL, {
            params: { page: currentPage, limit: itemsPerPage, search: searchTerm }
          });
          setArticulos(response.data.articulos);
          setTotalPages(Math.ceil(response.data.total / itemsPerPage));
        }

        setCargando(false);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError('Error al cargar el catálogo');
        setCargando(false);
      }
    };
    
    cargarArticulos();
  }, [currentPage, searchTerm]);

  const cambiarPagina = (nuevaPagina) => {
    if (nuevaPagina < 1 || nuevaPagina > totalPages) return;
    setCurrentPage(nuevaPagina);
    window.scrollTo(0, 0);
  };

  if (cargando) return <div className="cargando">Cargando catálogo...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!articulos || articulos.length === 0) {
    return <div>No hay artículos disponibles</div>;
  }

  return (
    <div className="contenedor-app">
      <header className="barra-superior">
      <div className="contenedor-buscador">
          <input
            type="text"
            placeholder="Buscar por nombre o código..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="input-buscador"
          />
        </div>
        <div className="marca">IPS AUTOPARTES</div>
        <div className="titulo-principal">
          <span>CATÁLOGO GENERAL</span>
        </div>
        <button className="boton-carrito" >
          CARRITO ({carrito.reduce((acc, item) => acc + item.cantidad, 0)})
        </button>
      </header>

      <main className="contenedor-articulos">
        {articulos.map(articulo => (
          <article key={articulo.codigo} className="tarjeta-articulo">
            <img 
              src={articulo.imagen} 
              alt={articulo.descripcion} 
              className="imagen-articulo"
              onError={(e) => {
                e.target.src = '/imagenes/fallback.jpg';
                e.target.alt = 'Imagen no disponible';
              }}
            />
            <div className="info-articulo">
              <h3 className="codigo">{articulo.codigo}</h3>
              <p className="descripcion">{articulo.descripcion}</p>
              <p className="precio">${articulo.precio}</p>
              <button 
                className="boton-anadir"
                onClick={() => añadirAlCarrito(articulo)}
              >
                Añadir al carrito
              </button>
            </div>
          </article>
        ))}
      </main>
      <div className="contenedor-paginacion">
        <button 
          className="boton-paginacion"
          onClick={() => cambiarPagina(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Anterior
        </button>
        
        <span>Página {currentPage} de {totalPages}</span>
        
        <button 
          className="boton-paginacion"
          onClick={() => cambiarPagina(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default ListaArticulos;