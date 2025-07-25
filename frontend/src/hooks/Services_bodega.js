import Cookies from 'js-cookie';
import {GET,POST} from './connection';


export async function get_bodega(token) {
    let datos = null;
    try {
        datos = await GET('bodega', token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500};
    }
    return datos.data;
}

export async function create_bodega(data, token) {
    try {
        return await POST('bodega/guardar', data, token);
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function update_bodega(data, params, token) {
    let datos = null;
    try {
        datos = await POST(`bodega/actualizar/${params.external}`, data, token);
        if (datos.code === 200) {
            // Aquí podrías actualizar la información relacionada con la bodega si es necesario
        }
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function deactivate_bodega(external, token) {
    let datos = null;
    try {
        datos = await GET(`bodega/desactivar/${external}`, token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function activate_bodega(external, token) {
    let datos = null;
    try {
        datos = await GET(`bodega/activar/${external}`, token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function get_bodega_by_external(params, token) {
    let datos = null;
    try {
        datos = await GET(`bodega/${params.external}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500};
    }
    return datos.data;
}

export async function get_bodega_by_id(bodega_id, token) {
    let datos = null;
    try {
        datos = await GET(`bodega/nombre/${bodega_id}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500};
    }
    return datos.data;
}

export async function get_stock_by_bodega(bodega_id, token) {
    let datos = null;
    try {
        datos = await GET(`bodega/stock/${bodega_id}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500};
    }
    return datos.data;
}

export async function get_bodega_by_usuario(usuario_id, token) {
    let datos = null;
    try {
        datos = await GET(`bodega/usuario/${usuario_id}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500};
    }
    return datos.data;
}