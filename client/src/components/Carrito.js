import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Carrito.css'; 
import { useCarrito } from '../context/CarritoContext';

const Carrito = () => {  
  const { carrito, actualizarCantidad, eliminarDelCarrito, vaciarCarrito } = useCarrito();
  const navigate = useNavigate();
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    metodoPago: 'efectivo'
  });

  const total = carrito.reduce((sum, item) => sum + (item.cantidad * item.precio), 0);

  const handleChange = (e) => {
    setDatosCliente({
      ...datosCliente,
      [e.target.name]: e.target.value
    });
  };

  const enviarMensajeTelegram = async (mensaje) => {
    try {
      await axios.post(`https://api.telegram.org/bot${process.env.REACT_APP_TELEGRAM_BOT_TOKEN}/sendMessage`, {
        chat_id: process.env.REACT_APP_TELEGRAM_CHAT_ID,
        text: mensaje,
        parse_mode: 'HTML'
      });
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const mensaje = `
<b>NUEVA COMPRA REALIZADA</b>\n
<u>Datos del cliente:</u>
├ Nombre: ${datosCliente.nombre}
├ Dirección: ${datosCliente.direccion}
├ Teléfono: ${datosCliente.telefono}
└ Método de pago: ${datosCliente.metodoPago.toUpperCase()}

<u>Detalles del pedido:</u>
${carrito.map(item => `
├ Producto: ${item.descripcion}
├ Código: ${item.codigo}
├ Cantidad: ${item.cantidad}
└ Subtotal: $${item.precio * item.cantidad}\n`).join('')}

<b>TOTAL: $${total}</b>\n
<i>Fecha: ${new Date().toLocaleString()}</i>
    `;

    try {
      await enviarMensajeTelegram(mensaje);
      alert('¡Compra exitosa! Se ha enviado la confirmación por Telegram.');
      vaciarCarrito(); // Vacía el carrito usando el contexto
      navigate('/'); // Redirige a la página principal
    } catch (error) {
      alert('Error al procesar la compra. Por favor intente nuevamente.');
    }
  };
  
  return (
    <div className="contenedor-carrito">
      <div className="caja-carrito">
        <button onClick={() => navigate(-1)} className="boton-volver">
          ← Volver
        </button>
          
        <h1 className="titulo-carrito">Tu Carrito de Compras</h1>
        
        {carrito.length === 0 ? (
          <p className="carrito-vacio">El carrito está vacío</p>
        ) : (
          <>
            <div className="lista-carrito">
              {carrito.map(item => (
                <div key={item.codigo} className="item-carrito">
                  <img 
                    src={item.imagen} 
                    alt={item.descripcion}
                    className="imagen-carrito"
                  />
                  
                  <div className="info-carrito">
                    <h3>{item.codigo}</h3>
                    <p>{item.descripcion}</p>
                    <div className="controles-cantidad">
                      <button onClick={() => actualizarCantidad(item.codigo, item.cantidad - 1)}>-</button>
                      <span>{item.cantidad}</span>
                      <button onClick={() => actualizarCantidad(item.codigo, item.cantidad + 1)}>+</button>
                    </div>
                    <p>Subtotal: ${(item.cantidad * item.precio).toLocaleString()}</p>
                  </div>
                
                  <button 
                    className="boton-eliminar"
                    onClick={() => eliminarDelCarrito(item.codigo)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              ))}
            </div>
            
            <form className="formulario-cliente" onSubmit={handleSubmit}></form>
              
            <form className="formulario-cliente" onSubmit={handleSubmit}>
              <h3 className="titulo-formulario">Información del Cliente</h3>
              
              <div className="grupo-formulario">
                <label>Nombre Completo:</label>
                <input
                  type="text"
                  name="nombre"
                  value={datosCliente.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grupo-formulario">
                <label>Dirección de Entrega:</label>
                <input
                  type="text"
                  name="direccion"
                  value={datosCliente.direccion}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="grupo-formulario">
                <label>Teléfono de Contacto:</label>
                <input
                  type="tel"
                  name="telefono"
                  value={datosCliente.telefono}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{10}"
                />
              </div>

              <div className="grupo-formulario">
                <label>Método de Pago:</label>
                <select
                  name="metodoPago"
                  value={datosCliente.metodoPago}
                  onChange={handleChange}
                  className="selector-pago"
                >
                  <option value="efectivo">Efectivo</option>
                  <option value="nequi">Nequi</option>
                  <option value="daviplata">DaviPlata</option>
                </select>
              </div>

              <div className="total-carrito">
                <h2>Total: ${total.toLocaleString()}</h2>
                <button type="submit" className="boton-pagar">
                  Finalizar Compra
                </button>
                </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Carrito;