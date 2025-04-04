import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ListaArticulos from './components/ListaArticulos';
import Carrito from './components/Carrito';

function App() {
  const [carrito, setCarrito] = useState([]);

  const añadirAlCarrito = (articulo) => {
    setCarrito(prev => {
      const existe = prev.find(item => item.codigo === articulo.codigo);
      return existe ? 
        prev.map(item => item.codigo === articulo.codigo ? 
          { ...item, cantidad: item.cantidad + 1 } : item) :
        [...prev, { ...articulo, cantidad: 1 }];
    });
  };

  const actualizarCantidad = (codigo, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    setCarrito(prev =>
      prev.map(item =>
        item.codigo === codigo ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  const eliminarDelCarrito = (codigo) => {
    setCarrito(prev => prev.filter(item => item.codigo !== codigo));
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={
          <ListaArticulos 
            carrito={carrito}
            añadirAlCarrito={añadirAlCarrito}
          />
        }/>
        <Route path="/carrito" element={
          <Carrito
            carrito={carrito}
            actualizarCantidad={actualizarCantidad}
            eliminarDelCarrito={eliminarDelCarrito}
          />
        }/>
      </Routes>
    </Router>
  );
}

export default App;