import Cookies from 'js-cookie';
import {GET,POST} from './connection';

export async function get_inventory(token) {
    let datos = null;
    try {
        datos = await GET('inventario', token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500};
    }
    return datos.data;
}

export async function registrar_entrada_inventario(data, token) {
    try {
        return await POST('inventario/entrada', data, token);
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function registrar_salida_inventario(data, token) {
    try {
        return await POST('inventario/salida', data, token);
    } catch (error) {
        console.error(error);
        return null;
    }
}
export async function update_inventory(data, params, token) {
    let datos = null;
    try {
        datos = await POST(`inventario/actualizar/${params.external}`, data, token);
        if (datos.code === 200) {
            // Aquí podrías actualizar la información relacionada con el inventario si es necesario
        }
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}


export async function get_tipos_documento(token) {
    let datos = null;
    try {
        datos = await GET('/inventario/tipos_documento', token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500};
    }
    return datos.data;
}

export async function get_inventory_by_producto(producto_id, token) {
    let datos = null;
    try {
        datos = await GET(`inventario/producto/${producto_id}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500};
    }
    return datos.data;
}