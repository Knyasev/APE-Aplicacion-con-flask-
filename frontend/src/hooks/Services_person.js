import Cookies from 'js-cookie';
import {GET,POST} from './connection';

export async function  all_person(token){
    let datos = null;
    try {

        datos = await GET('persona',token);
    } catch (error) {
        console.log(error.response.data);
        return{"code": 500}
    }
    return datos.data;
    // TODO agarrar errores
}
export async function create_person(data, token) {
        try {
            return await POST('persona/guardar/censado', data, token);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

export async function update_person(data,params, token) {
        try {
            return await POST('persona/'+params.external, data, token);
        } catch (error) {
            console.error(error);
            return null;
        }
    }    

export async function get_estados(token){
    let datos = null;
    try {
        datos = await GET('listar_estados',token);
    } catch (error) {
        console.log(error.response.data);
        return{"code": 500}
    }
    return datos.data;
    // TODO agarrar errores
}    

export async function  get_person(token,params){
    let datos = null;
    try {

        datos = await GET('person/'+params.external,token);
    } catch (error) {
        console.log(error.response.data);
        return{"code": 500}
    }
    return datos.data;
    // TODO agarrar errores
}