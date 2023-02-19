import React from 'react'
import { useNavigate } from 'react-router-dom'
import { auth } from '../../../firebase'
import { ChatContext } from '../../../context/UsuarioProvider'
import Agregar from './Agregar';
import { addDoc, collection, getDocs, doc, getDoc, onSnapshot, orderBy, query, where, setDoc } from 'firebase/firestore';

import { db } from '../../../firebase'

const Mensajes = () => {
  const navegar = useNavigate();
  const {usuario} = React.useContext(ChatContext);
  const [listaAmigos, setListaAmigos] = React.useState(['']);
  const [mensajes, setMensajes] = React.useState([]);
  const [infoAmigo, setInfoAmigo] = React.useState('');
  const [amigoId, setAmigoId] = React.useState('');
  const [clickAmigo, setClickAmigo] = React.useState(false);

  const refZonaChat = React.useRef(null);

  React.useEffect(()=>{
    if (!auth.currentUser) {
      navegar('/');
    }

    if(mensajes.length >= 8) {
      refZonaChat.current.scrollTop = refZonaChat.current.scrollHeight-15;
    }

    const obtenerAmigos = async () => {
      try {
        const data = await getDocs(collection(db, 'usuarios'));
        const arrayLista = data.docs.map(doc => ({id: doc.id, ...doc.data()}));
        setListaAmigos(arrayLista);
        
      } catch (error) {
        console.log(error)
      }
    }

    obtenerAmigos();
  }, [navegar, mensajes])

  //MANDO COMO PARAMETRO EL ID DEL USUARIO SELECCIONADO
  const mostrarAmigo = async (id) => {
      try {
        setClickAmigo(true);
        const res = await getDoc(doc(db, 'usuarios', id));
        const amigo = res.data();

        setInfoAmigo(amigo.nombre);
        setAmigoId(amigo.uid);

        const idAmigo = res.data().uid;
        
        cargarMensajes(idAmigo);
      } catch (error) {
        console.log(error)
      }
    }

    const mandarMensaje = async (mensaje, idAmigo) => {
      if (!mensaje) {
        return
      }
        //Busco si ya existe una conversacion entre los dos usuarios
        const resultado = await usuarioEsUno(idAmigo);
        const resultado2 = await usuarioEsDos(idAmigo);

        //Si recibe una respuesta de alguna funcion la pregunto en cual y lo almaceno en chat_id
        if (resultado || resultado2) {
          let chat_id;

          if(resultado){
            chat_id = resultado;
          }
          else if(resultado2){
            chat_id = resultado2;
          }

          await addDoc(collection(db, 'mensajes'), {
            chat_id: chat_id,
            uid: usuario.uid,
            mensaje: mensaje,
            fecha: Date.now()
          });
          
          //Si no hay respuesta entonces creo el chat en la tabla chats
        }else {
          let chat_id;
          addDoc(collection(db, 'chats'), {
            usuario1: usuario.uid,
            usuario2: idAmigo
          });

          //Una vez guardado el chat busco el id
          const resultado3 = await usuarioEsUno(idAmigo);
          const resultado4 = await usuarioEsDos(idAmigo);

          if (resultado3) {
            chat_id = resultado3;
          }else if (resultado4) {
            chat_id = resultado4;
          }

          await addDoc(collection(db, 'mensajes'),{
            chat_id: chat_id,
            uid: usuario.uid,
            mensaje: mensaje,
            fecha: Date.now()
          });
        }
    }

    const usuarioEsUno = async (idAmigo) =>{
      const q = query(
          collection(db, 'chats'),
          where('usuario1', '==', usuario.uid),
          where('usuario2', '==', idAmigo)
      );

      const querySnapShot = await getDocs(q);
      const arrayLista = querySnapShot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      let chat_id = 0;

      if (arrayLista.length == 1) {
          chat_id = arrayLista[0].id;
      }

      return chat_id;
  }

  const usuarioEsDos = async (idAmigo) =>{
      const q = query(
          collection(db, 'chats'),
          where('usuario1', '==', idAmigo),
          where('usuario2', '==', usuario.uid)
      );

      const querySnapShot = await getDocs(q);
      const arrayLista = querySnapShot.docs.map(doc => ({id: doc.id, ...doc.data()}));
      let chat_id = 0;

      if (arrayLista.length == 1) {
          chat_id = arrayLista[0].id;
      }

      return chat_id;
  }

  const cargarMensajes = async (idAmigo) => {
    //Vacio el contenido del array
    setMensajes([]);

    //Busco el id de la conversacion y la traigo
    const resultado = await usuarioEsUno(idAmigo);
    const resultado2 = await usuarioEsDos(idAmigo);

    let chat_id;

    //SI EN ALGUNA DE LAS 2 OBTUVE RESPUESTA LO ALMACENO EN CHAT_ID
    if(resultado){
        chat_id = resultado;
    }
    else if(resultado2){
        chat_id = resultado2;
    }

    if (chat_id) {
      const consulta = query(
        collection(db, 'mensajes'),
        where('chat_id','==', chat_id),
        orderBy('fecha'),
      );
      onSnapshot( 
            consulta,
            query => {
                const arrayMensajes = query.docs.map(item => item.data());
                setMensajes(arrayMensajes);
            }
            
      );
      
    }

}

  return (
    <div className='row'
    //si no funciona vh100 cambiar a 75
      style={{height: '100vh', overflowY: 'scroll'}}
      ref={refZonaChat}
    >
        <div className='col-md-4'>
          <h5 className='ms-3 mt-3 py-2'>Mensajes</h5>

            {
              listaAmigos.map((item, index) => (
                //PARA QUE NO SE MUESTRE EL USUARIO ACTUAL HAGO ESTE IF
                usuario.uid !== item.uid && (
                  <div className="card bg-dark py-3" key={index}>
                    <button className="btn btn-dark text-start" onClick={() => mostrarAmigo(item.uid)}>
                      <img src={item.fotoPerfil} className='img-fluid float-start rounded-circle me-2' width='64px' />
                      <p className='ms-5 mt-3 py-2 text-white text-start'>{item.nombre}</p>
                    </button>
                  </div>
                )
              ))
            }
        </div>

        <div className='col-md-8'>
            <h5 className='ms-3 mt-3 py-2'>
              {infoAmigo}
            </h5>
          <hr />
          <div>
            {
              //SI SELECCIONA UN USUARIO SE MUESTRAN LOS MENSAJES
              clickAmigo === true ? (
                mensajes.length !== 0 ? (
                  mensajes.map((item, index) => (
                      usuario.uid === item.uid ? (
                          <div className='d-flex justify-content-end mb-2' key={index}>
                            <span className='btn btn-primary'>
                             {item.mensaje}
                            </span>
                          </div>
                    ) : (
                        <div className='d-flex justify-content-start mb-2' key={index}>
                            <span className='btn btn-secondary'>
                              {item.mensaje}
                            </span>
                          </div>
                      )
                    )
                  
                  )
                ) : (
                  <h5 className='text-center'>Esta conversación aún no tiene mensajes</h5>
                )
              ) : (
                <h4>Selecciona un amigo para leer los mensajes</h4>
              )
            
            }
          </div>
          {
            amigoId && (<Agregar amigoId={amigoId} mandarMensaje={mandarMensaje}/>)
          }
        </div>
    </div>
  )
}

export default Mensajes