'use client';
import { useEffect, useState } from 'react';
import { get_stock_by_bodega } from '@/hooks/Services_bodega';
import Cookies from 'js-cookie';

export default function MovimientosModal({ producto_nombre, onClose, movimientos = [], bodegas = {} }) {
    return (
        <div className="modal-backdrop" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '8px',
                width: '90%',
                maxWidth: '1200px',
                maxHeight: '80vh',
                overflowY: 'auto'
            }}>
                <div className="modal-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                }}>
                    <h3>Movimientos del Producto: {producto_nombre}</h3>
                    <button onClick={onClose} style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '1.5rem',
                        cursor: 'pointer'
                    }}>×</button>
                </div>
                
                <div className="table-responsive">
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Bodega</th>
                                <th>Cantidad</th>
                                <th>Fecha</th>
                                <th>Precio Unitario</th>
                                <th>Precio Total</th>
                                <th>Tipo</th>
                                <th>N° Comprobante</th>
                                <th>Tipo Comprobante</th>
                                <th>Proveedor</th>
                            </tr>
                        </thead>
                        <tbody>
                            {movimientos.length > 0 ? (
                                movimientos.map((movimiento, index) => (
                                    <tr key={index}>
                                        <td>{bodegas[movimiento.bodega_id] || `Bodega ${movimiento.bodega_id}`}</td>
                                        <td>{movimiento.cantidad}</td>
                                        <td>{new Date(movimiento.fecha).toLocaleString()}</td>
                                        <td>${movimiento.precio_unitario}</td>
                                        <td>${movimiento.precio_total === "None" ? '0.00' : movimiento.precio_total}</td>
                                        <td>
                                            <span className={`badge ${
                                                movimiento.tipo === 'ENTRADA' ? 'bg-success' : 'bg-danger'
                                            }`}>
                                                {movimiento.tipo}
                                            </span>
                                        </td>
                                        <td>{movimiento.numero_comprobante || 'N/A'}</td>
                                        <td>{movimiento.tipo_comprobante || 'N/A'}</td>
                                        <td>{movimiento.proveedor || 'N/A'}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="9" className="text-center py-4">No hay movimientos registrados</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}