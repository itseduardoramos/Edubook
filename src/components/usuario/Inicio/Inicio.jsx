import React from 'react';
import { auth, storage, db } from '../../../firebase';
import { useNavigate, NavLink } from 'react-router-dom';
import { ChatContext } from '../../../context/UsuarioProvider';
import { addDoc, setDoc, collection, onSnapshot, doc, getDoc, where, query, getDocs, deleteDoc } from 'firebase/firestore';
import SubirPublicacion from './SubirPublicacion';
import Comentarios from './Comentarios';

const Inicio = () => {
  const navegar = useNavigate();
  const {usuario} = React.useContext(ChatContext);
  const [publicaciones, setPublicaciones] = React.useState([]);
  var nvaPublicacion = {};
  var publicacionesId = [];
  const [comentarios, setComentarios] = React.useState(false);

  React.useEffect(()=>{
    if (!auth.currentUser) {
      navegar("/");
    }
    
    obtenerPublicaciones();
  }, [navegar]);

  const obtenerPublicaciones = async() => {
    onSnapshot(
      collection(db, 'publicaciones'),
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

  return (
      <div className="row">
        <div className="col-md-3 border-end">
          <img src={usuario.fotoPerfil} alt="" className="img-fluid float-start rounded-circle ms-3 py-2" width="64px"/>
          <h5 className="ms-3 mt-3 py-2">{usuario.nombre}</h5>

        </div>
        <div className="col-md-9">

            <SubirPublicacion />

            {
              publicaciones.map((item, index) => (
                <div className="card mt-5 me-3 ms-3 text-light bg-dark" key={index}>
                  <div className="card-header bg-dark">
                  <img src={item.fotoPerfil} className='img-fluid float-start rounded-circle' width='44px' />
                  <div className="d-grip gap-2">
                    <p className='float-start'>{item.nombre}</p>
                    <p className='float-end'>{item.fecha}</p>
                  </div>
                  </div>
                  <div className="card-body">
                    <p>{item.texto}</p>
                    {
                      item.foto && (
                        <img src={item.foto} className='rounded mx-auto d-block img-fluid' />
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

                    <button className='col btn btn-secondary-dark text-light' onClick={e => darLike(e, item.id, item.uid, item.texto, item.foto, item.fecha, item.likes)}>
                      Like
                    </button>
                    
                    <button className='col btn btn-secondary-dark text-light' onClick={e => obtenerComentarios(e, item.id)}>
                      Comentar
                    </button>

                    <button className='col btn btn-secondary-dark text-light' onClick={e => reportarPublicacion(e, item.id)}>
                      Reportar
                    </button>
                  </div>
                  {
                    comentarios === true && (
                      <Comentarios id={item.id}/>
                    )
                  }
                </div>
              ))
            }

        </div>
      </div>
  )
}

export default Inicio