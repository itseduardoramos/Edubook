import React from 'react'
import { ChatContext } from '../../../context/UsuarioProvider';
import { NavLink } from 'react-router-dom';
import { auth, db, storage } from '../../../firebase';
import { useNavigate } from "react-router-dom";
import { async } from '@firebase/util';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, query, setDoc, where } from 'firebase/firestore';
import SubirPublicacion from '../Inicio/SubirPublicacion';
import Comentarios from '../Inicio/Comentarios';

const Perfil = () => {
  const {usuario, setUsuario} = React.useContext(ChatContext)
  const navegar = useNavigate();
  const [publicaciones, setPublicaciones] = React.useState([]);
  const [comentarios, setComentarios] = React.useState([]);
  const [activarFormulario, setActivarFormulario] = React.useState(false);
  const [nuevoNombre, setNuevoNombre] = React.useState('');
  var nvaPublicacion = {};

  React.useEffect(()=>{
    if (!auth.currentUser) {
      navegar("/")
    }

    obtenerPublicaciones();
  },[navegar])

  const obtenerPublicaciones = async() => {
    onSnapshot(
      query(
        collection(db, 'publicaciones'),
        where('uid', '==', usuario.uid)
      ),
      query => {
        const publicacionesLista = query.docs.map(item => ({id: item.id, ...item.data()}));
        const publicacionesNvaLista = publicacionesLista.map(item =>
          nvaPublicacion = {
            id: item.id,
            uid: item.uid,
            texto: item.texto,
            foto: item.foto,
            fecha: item.fecha,
            likes: item.likes,
          }
        );
        obtenerPublicacionesCompletas(publicacionesNvaLista)
      }
    );
  }

  const obtenerPublicacionesCompletas = async(listado) => {
    var usuariosId = [];
    var fotos = [];
    var nombres = [];

    if (listado) {
      //Recorro el arreglo de las publicaciones y le paso solo los id al arreglo usuariosId
      listado.forEach(item =>
        usuariosId.push(item.uid)
      );

      //Puedo usar getDownloadURL en lugar de getDoc
      //Traigo la url de la foto de perfil de cada usuario del arreglo recorriendo el array
      for (let i = 0; i < usuariosId.length; i++) {
        const res = await getDoc(doc(db, 'usuarios', usuariosId[i]));
        
        fotos[i] = res.data().fotoPerfil;
        nombres[i] = res.data().nombre;
      }

      //Recorro  el arreglo de las publicaciones y les asigno la propiedad fotoPerfil con la url y la propiedad nombre
      for (let i = 0; i < listado.length; i++) {
        listado[i].fotoPerfil = fotos[i];
        listado[i].nombre = nombres[i];
      }

      setPublicaciones(listado);
      
    }
  }

  const darLike = async(e, publicacionId, uid, texto, foto, fecha, likes) => {
    e.preventDefault();

    if (!foto) {
      foto = null
    }

    const q = query(
      collection(db, 'usuario_likes'),
      where('publicacionId', '==', publicacionId),
      where('uid', '==', usuario.uid )
    );

    const res = await getDocs(q);
    const registro = res.docs.map(item => ({id: item.id, ...item.data()}));

    //Si viene vacio es porque no ha dado like y lo agrego
    if (registro.length == 0) {
      await addDoc(collection(db, 'usuario_likes'), {
        publicacionId: publicacionId,
        uid: usuario.uid,
      });

      await setDoc(doc(db, 'publicaciones', publicacionId), {
        uid: uid,
        fecha: fecha,
        texto: texto,
        foto: foto,
        likes: likes + 1
      });

    }else{
      await deleteDoc(doc(db, 'usuario_likes', registro[0].id));

      await setDoc(doc(db, 'publicaciones', publicacionId), {
        uid: uid,
        fecha: fecha,
        texto: texto,
        foto: foto,
        likes: likes - 1
      });
    }
  }

  const obtenerComentarios = async(e) => {
    e.preventDefault();

    if (comentarios == false) {
      setComentarios(true);
    }else{
      setComentarios(false);
    }
  }

  const reportarPublicacion = async(e, publicacionId) => {
    e.preventDefault();

    //Busco si el usuario ya reporto la publicacion
    const q = query(
                  collection(db, 'reportes'),
                  where('uid', '==', usuario.uid),
                  where('publicacionId', '==', publicacionId)
    )

    const res = await getDocs(q);
    const reporteUsuario = res.docs.map(item => ({id: item.id, ...item.data()}));

    //En caso de ya haber reportado la publicacion ya no le permito volver a hacerlo
    if (reporteUsuario.length == 1) {
      return;
    }else{
      await addDoc(collection(db, 'reportes'), {
        uid: usuario.uid,
        publicacionId: publicacionId
      });
    }

    //Consulto los reportes que ha recibido la publicacion
    const q2 = query(
      collection(db, 'reportes'),
      where('publicacionId', '==', publicacionId)
    )

    const res2 = await getDocs(q2);
    const listaReportes = res2.docs.map(item => ({id: item.id, ...item.data()}));

    //Si la publicacion ya se reporto 5 veces entonces la borro
    if (listaReportes.length == 5) {
      await deleteDoc(doc(db, 'publicaciones', publicacionId));

    }
  }

  const seleccionarFotoPerfil = async(infoImagen) => {
    if (!infoImagen) {
      return;
    }

    const imagen = infoImagen.target.files[0];
    const metadata = {
      contentType: 'image/jpeg'
    };

    let urlFoto;
    try {
      const imagenRef = ref(storage, `imagenes/${usuario.uid}`);
      await uploadBytesResumable(imagenRef, imagen, metadata);

      //const fotoURL = await getDownloadURL(ref(storage, `imagenes/${usuario.uid}`));

      await getDownloadURL(ref(storage, `imagenes/${usuario.uid}`))
            .then((url) => {
              urlFoto = url;
            })
            .catch((error) => {
              // Handle any errors
            });
      
      await setDoc(doc(db, 'usuarios', usuario.uid),{
        uid: usuario.uid,
        nombre: usuario.nombre,
        fotoPerfil: urlFoto,
        email: usuario.email,
        estado: true
      });

    } catch (error) {
      console.log(error);
    }

    actualizarUsuario();
  }

  const actualizarNombre = () => {
    if (!nuevoNombre) {
      return;
    }

    try {
      setDoc(doc(db, 'usuarios', usuario.uid), {
        uid: usuario.uid,
        nombre: nuevoNombre,
        email: usuario.email,
        fotoPerfil: usuario.fotoPerfil,
        estado: usuario.estado
      })
    } catch (error) {
      console.log(error)
    }
    
    actualizarUsuario();

    setActivarFormulario(false);
  }

  const actualizarUsuario = async() => {

    onSnapshot(
        doc(db, 'usuarios', usuario.uid),
        query => {
            const res = query.data();
            setUsuario({uid: res.uid, nombre: res.nombre, fotoPerfil: res.fotoPerfil, email: res.email, estado: res.estado});
            localStorage.setItem('usuario', JSON.stringify({uid: res.uid, nombre: res.nombre, fotoPerfil: res.fotoPerfil, email: res.email, estado: res.estado}));
        }
    )
}


  return (
      <div className="row">
        <div className="col-md-3 border-end">
          <img src={usuario.fotoPerfil} className="img-fluid float-start rounded-circle ms-3 py-2" width="64px" />
          <h5 className="ms-3 mt-3 py-2">{usuario.nombre}</h5>

          <NavLink to="/amigos" className="text-dark text-decoration-none">
              <h5 className="ms-3 mt-3 py-2">
                Amigos
              </h5>
          </NavLink>
          
          <NavLink to="/configuracion" className="text-dark text-decoration-none">
              <h5 className="ms-3 mt-3 py-2 ">
                Configuracion  de la cuenta
              </h5>
          </NavLink>

        </div>
        <div className="col-md-9">
          <div className="card text-center bg-dark">
            <div className="card-body bg-dark">
              <img src={usuario.fotoPerfil} width='120' className='img-fluid'/>
              <div className=""></div>
              <h5 className='card-title mt-2'>
                {usuario.nombre}
              </h5>
              {
                usuario.uid === 'Sv3opJqHL6UuXkTNWlJB63KBKVH2' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-patch-check-fill" viewBox="0 0 16 16">
                    <path d="M10.067.87a2.89 2.89 0 0 0-4.134 0l-.622.638-.89-.011a2.89 2.89 0 0 0-2.924 2.924l.01.89-.636.622a2.89 2.89 0 0 0 0 4.134l.637.622-.011.89a2.89 2.89 0 0 0 2.924 2.924l.89-.01.622.636a2.89 2.89 0 0 0 4.134 0l.622-.637.89.011a2.89 2.89 0 0 0 2.924-2.924l-.01-.89.636-.622a2.89 2.89 0 0 0 0-4.134l-.637-.622.011-.89a2.89 2.89 0 0 0-2.924-2.924l-.89.01-.622-.636zm.287 5.984-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7 8.793l2.646-2.647a.5.5 0 0 1 .708.708z"/>
                  </svg>
                )
              }
              <p className='card-text'>{usuario.email}</p>

              <div className="d-grid gap-2">
                <label htmlFor="cambiarFoto" className='btn btn-secondary-dark text-light'>Cambiar foto de perfil</label>
                <input type="file" id="cambiarFoto" onChange={e => seleccionarFotoPerfil(e)} hidden />
                
                <button className="btn btn-secondary-dark text-light" onClick={() => setActivarFormulario(true)}>
                  Editar nombre
                </button>

                {
                  activarFormulario && (
                    <div className="card-body">
                      <div className="row">
                        <div className="row justify-content-center">
                          <div className="col md-5">
                            <div className="input-group mb-3">
                              <input type="text" className='form-control' onChange={e => setNuevoNombre(e.target.value)} />
                              <div className="input-group-append">
                                <button className="btn btn-dark" onClick={() => actualizarNombre()}>
                                  Actualizar nombre
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
          </div>

          <div className="mt-5">
            <SubirPublicacion />

            <h4 className='mt-5'>Mis publicaciones</h4>

            {
              publicaciones.map((item, index) =>
              <div className="card mt-5 me-3 ms-3" key={index}>
              <div className="card-header">
              <img src={item.fotoPerfil} className='img-thumbnail float-start rounded-circle' width='44px' />
              <div className="d-grip gap-2">
                <b className='float-start'>{item.nombre}</b>
                <p className='text-muted float-end'>{item.fecha}</p>
              </div>
              </div>
              <div className="card-body">
                <p>{item.texto}</p>
                {
                  item.foto && (
                    <img src={item.foto} className='mw-5 img-fluid' />
                  )
                }
              </div>

              <div className="row me-3 ms-3">
                {
                  item.likes === 0 ? (
                    <div className="float-start text-success"><p>Reaccionar</p></div>
                  ) : (
                    <div className="float-start text-success"><p>{item.likes} reacciones</p></div>
                  )
                }

                <button className='col btn btn-secondary-dark text-dark' onClick={e => darLike(e, item.id, item.texto, item.fecha, item.likes)}>
                  Like
                </button>
                
                <button className='col btn btn-secondary-dark text-dark' onClick={e => obtenerComentarios(e, item.id)}>
                  Comentar
                </button>

                <button className='col btn btn-secondary-dark text-dark' onClick={e => reportarPublicacion(e, item.id)}>
                  Reportar
                </button>
              </div>
              {
                comentarios === true && (
                  <Comentarios id={item.id}/>
                )
              }
            </div>
              )
            }
          </div>
        </div>

      </div>
  )
}

export default Perfil