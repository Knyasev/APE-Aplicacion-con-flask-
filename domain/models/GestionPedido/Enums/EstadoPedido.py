from enum import Enum

class EstadoPedido(Enum):
    
    CREADO = 'CREADO'
    ENVIADO = 'ENVIADO'
    ENTREGADO = 'ENTREGADO'
    CANCELADO = 'CANCELADO'