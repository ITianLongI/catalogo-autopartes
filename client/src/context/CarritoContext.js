// client/src/context/CarritoContext.js
import { createContext, useContext, useState } from 'react';

const CarritoContext = createContext();

export const CarritoProvider = ({ children }) => {
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
    setCarrito(prev =>
      prev.map(item =>
        item.codigo === codigo ? { ...item, cantidad: nuevaCantidad } : item
      )
    );
  };

  const eliminarDelCarrito = (codigo) => {
    setCarrito(prev => prev.filter(item => item.codigo !== codigo));
  };
  const vaciarCarrito = () => {
    setCarrito([]);
  };
  

  return (
    <CarritoContext.Provider
    value={{
        carrito,
        añadirAlCarrito,
        actualizarCantidad,
        eliminarDelCarrito,
        vaciarCarrito // ← Nueva función
      }}
    >
      {children}
    </CarritoContext.Provider>
  );
};

export const useCarrito = () => useContext(CarritoContext);