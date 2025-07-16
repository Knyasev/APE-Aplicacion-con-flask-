import {POST} from './connection';

export async function login(data){
    let datos = null
    try {
    datos = await POST("sesion",data);
    
    }catch (error) {
        //console.log(error.data);
        return error.response.data;
    
    }
    return datos.data;
    //TODO AGARRAR ERRORES DE LA API
     }