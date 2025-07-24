import Cookies from 'js-cookie';
import {GET,POST} from './connection';

export async function  get_sucursal(token){
    let datos = null;
    try {

        datos = await GET('sucursal',token);
    } catch (error) {
        console.log(error.response.data);
        return{"code": 500}
    }
    return datos.data;
    // TODO agarrar errores
}


export async function create_sucursal(data, token) {
    try {
        return await POST('sucursal/guardar', data, token);
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function update_sucursal(data, params, token) {
    let datos = null;
    try {
        datos = await POST(`sucursal/actualizar/${params.external}`, data, token);
        if (datos.code === 200) {
            // Actualizar información del usuario si es necesario
            if (data.external) {
                // Aquí podrías actualizar la información relacionada con la sucursal si es necesario
            }   
        }
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}


export async function deactivate_sucursal(external, token) {
    let datos = null;
    try {
        datos = await GET(`sucursal/desactivar/${external}`, token);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}


export async function activate_sucursal(external) {
    let datos = null;
    try {
        datos = await GET(`sucursal/activar/${external}`);
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}


export async function get_sucursal_by_external(params, token) {
    let datos = null;
    try {
        datos = await GET(`sucursal/${params.external}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500}
    }
    return datos.data;
}

export async function get_sucursal_by_id(sucursal_id, token) {
    let datos = null;
    try {
        datos = await GET(`sucursal/id/${sucursal_id}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500}
    }
    return datos.data;
}

export async function get_sucursal_by_bodega_id(bodega_id, token) {
    let datos = null;
    try {
        datos = await GET(`/sucursal/bodega/${bodega_id}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500}
    }
    return datos.data;
}


export async function get_sucursal_by_usuario(admin_id, token) {
    let datos = null;
    try {
        datos = await GET(`/sucursal/usuario/${admin_id}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500}
    }
    return datos.data;
}