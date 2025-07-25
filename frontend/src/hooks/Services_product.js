import Cookies from 'js-cookie';
import {GET,POST} from './connection';
import { update_person } from './Services_person';

export async function  get_product(token){
    let datos = null;
    try {

        datos = await GET('producto',token);
    } catch (error) {
        console.log(error.response.data);
        return{"code": 500}
    }
    return datos.data;
    // TODO agarrar errores
}

export async function get_product_by_id(id, token) {
    let datos = null;
    try {
        datos = await GET(`/producto/nombre/${id}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500};
    }
    return datos.data;

}
export async function create_product(data, token) {
    try {
        return await POST('producto/guardar', data, token);
    } catch (error) {
        console.error(error);
        return null;
    }

}
export async function update_product(data, params, token) {
    let datos = null;
    try {
        datos = await POST(`producto/actualizar/${params.external}`, data, token);
        if (datos.code === 200) {
            // Actualizar información del usuario si es necesario
            if (data.external) {
                await update_person({ external: data.external}, params, token);
            }   
        }
    } catch (error) {
        console.error(error);
        return {"code": 500, "error": error.message};
    }
    return datos.data;
}

export async function get_product_external(params, token) {
    let datos = null;
    try {
        console.log(`URL generada: producto/${params.external}`); // Verifica la URL
        datos = await GET(`producto/${params.external}`, token);
    } catch (error) {
        console.log("Error en la petición:", error.response?.data || error.message);
        return { "code": 500 };
    }
    console.log("Datos recibidos:", datos?.data); // Verifica los datos recibidos
    return datos?.data || null; // Asegúrate de devolver un valor válido
}

export async function get_categoria(token) {
    let datos = null;
    try {
        datos = await GET(`categoria`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500}
    }
    return datos.data;
}

export async function listar_categorias(token, categoria_id = null) {
    let datos = null;
    try {
        datos = await GET(`/producto/categoria/${categoria_id}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500}
    }
    return datos.data;
}

export async function create_categoria(data, token) {
    try {
        return await POST('categoria/guardar', data, token);
    } catch (error) {
        console.error(error);
        return null;
    }
}

export async function update_categoria(data, params, token) {
    let datos = null;
    try {
        datos = await POST(`categoria/actualizar/${params.external}`, data, token);
        if (datos.code === 200) {
        }
    } catch (error) {
        console.error(error);
        return {"code": 500, "datos": error.response.data};
    }
    return datos.data;
}

export async function get_categoria_by_external(params, token) {
    let datos = null;
    try {
        datos = await GET(`categoria/${params.external}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500}
    }
    return datos.data;
}


export async function get_stock_by_producto(producto_id, token) {
    let datos = null;
    try {
        datos = await GET(`producto/stock/${producto_id}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500}
    }
    return datos.data;
}



export async function get_productos_id(producto_id, token) {
    let datos = null;
    try {
        datos = await GET(`producto/id/${producto_id}`, token);
    } catch (error) {
        console.log(error.response.data);
        return {"code": 500}
    }
    return datos.data;
}