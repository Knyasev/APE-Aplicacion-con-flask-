import {GET,POST} from './connection';

export async function get_pedido(token) {
    let datos = null;
    try {
        datos = await GET('pedido', token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function create_pedido(data, token) {
    let datos = null;
    try {
        datos = await POST('pedido/guardar', data, token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function get_pedido_by_external(params, token) {
    let datos = null;
    try {
        datos = await GET(`pedido/${params.external}`, token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function update_pedido(params, data, token) {
    let datos = null;
    try {
        datos = await POST(`pedido/modificar/${params.external}`, data, token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function delete_pedido(external, token) {
    let datos = null;
    try {
        datos = await GET(`pedido/delete/${external}`, token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function get_pedido_by_id(pedido_id, token) {
    let datos = null;
    try {
        datos = await GET(`pedido/id/${pedido_id}`, token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function get_pedido_by_usuario_sucursal(admin_id, sucursal_id, token) {
    let datos = null;
    try {
        datos = await GET(`pedido/sucursal/${sucursal_id}/usuario/${admin_id}`, token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function get_detalles_pedido(pedido_id, token) {
    let datos = null;
    try {
        datos = await GET(`pedido/detalle/${pedido_id}`, token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function cambiar_estado_entregado(external, token) {
    let datos = null;
    try {
        datos = await GET(`pedido/entregado/${external}`, token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function cambiar_estado_cancelado(external, token) {
    let datos = null;
    try {
        datos = await GET(`pedido/cancelar/${external}`, token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}