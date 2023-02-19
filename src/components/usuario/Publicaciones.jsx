import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatContext } from '../../context/UsuarioProvider';
import { auth, db } from '../../firebase';
import { addDoc, collection, updateDoc, doc, where, query, onSnapshot, getDocs, getDoc, deleteDoc } from 'firebase/firestore';
import Comentarios from './Inicio/Comentarios';

const Publicaciones = (props) => {
  const navegar = useNavigate();
  const {usuario} = React.useContext(ChatContext);
  const [publicaciones, setPublicaciones] = React.useState([]);
  const [comentarios, setComentarios] = React.useState(false);

  React.useEffect(()=>{
    if (!auth.currentUser) {
      navegar("/")
    }

    obtenerPublicaciones();
  },[navegar])

  const obtenerPublicaciones = async() => {
    let q = "";
    if(props.uid){
      q = query(collection(db, 'publicaciones'), where('uid','==',usuario.uid));

    }else{
      q = query(collection(db, 'publicaciones'));
    }

    onSnapshot(
      q,
      query => {
        const publicacionesLista = query.docs.map(item => ({id: item.id, ...item.data()}));
        obtenerPublicacionesCompletas(publicacionesLista)
      }
    );
  }
    
  const obtenerPublicacionesCompletas = async(listado) => {
    if (listado) {
      if (props.uid) {
        for (let i = 0; i < listado.length; i++) {
          listado[i].fotoPerfil = usuario.fotoPerfil;
          listado[i].nombre = usuario.nombre
        }

      }else{
        for (let i = 0; i < listado.length; i++) {
          try {
            const res = await getDoc(doc(db, 'usuarios', listado[i].uid));
            listado[i].fotoPerfil = res.data().fotoPerfil;
            listado[i].nombre = res.data().nombre;
    
          } catch (error) {
            console.log(error)
          }
        }
      }
      
      setPublicaciones(listado);
    }
  }

  const darLike = async(e, publicacionId, foto, likes) => {
    e.preventDefault();
    
    if (!foto) { foto = null }
    
    const q = query(collection(db,'usuario_likes'), where('publicacionId', '==', publicacionId), where('uid', '==', usuario.uid));
    const res = await getDocs(q);
    const numLikes = res.docs.map(item => ({id: item.id}));
    
    //Si viene vacio es porque no ha dado like y lo agrego
    if (numLikes.length == 0) {
      await addDoc(collection(db, 'usuario_likes'), {
        publicacionId: publicacionId,
        uid: usuario.uid,
      });

      await updateDoc(doc(db, 'publicaciones', publicacionId), {likes: likes+1});

    }else{
      await deleteDoc(doc(db, 'usuario_likes', numLikes[0].id));
      await updateDoc(doc(db, 'publicaciones', publicacionId), {likes: likes-1})
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
    
    const q = query(collection(db, 'reportes'), where('uid', '==', usuario.uid), where('publicacionId', '==', publicacionId))
    const res = await getDocs(q);
    const reporteUsuario = res.docs.map(item => ({id: item.id, ...item.data()}));
    
    if (reporteUsuario.length == 1) { return; }
    else{
      await addDoc(collection(db, 'reportes'), { uid: usuario.uid, publicacionId: publicacionId });
    }
    
    const q2 = query(collection(db, 'reportes'), where('publicacionId', '==', publicacionId))
    const res2 = await getDocs(q2);
    const listaReportes = res2.docs.map(item => ({id: item.id, ...item.data()}));
    
    //Si la publicacion ya se reporto 5 veces entonces la borro
    if (listaReportes.length == 5) {
      await deleteDoc(doc(db, 'publicaciones', publicacionId));
    
    }
  }

  return (
    <div className="col">
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
                {item.foto && (<img src={item.foto} className='rounded mx-auto d-block img-fluid' />)}
            </div>

            <div className="row me-3 ms-3">
              {item.likes === 0 ? (<div className="float-start text-success"><p>Reaccionar</p></div>) :
                (<div className="float-start text-success"><p>{item.likes} reacciones</p></div>)}

                <button className='col btn btn-secondary-dark text-light' onClick={e => darLike(e, item.id, item.foto, item.likes)}>
                  Like
                </button>
                  
                <button className='col btn btn-secondary-dark text-light' onClick={e => obtenerComentarios(e, item.id)}>
                  Comentar
                </button>

                <button className='col btn btn-secondary-dark text-light' onClick={e => reportarPublicacion(e, item.id)}>
                  Reportar
                </button>
            </div>
                {comentarios === true && (<Comentarios id={item.id}/>)}
          </div>
        ))
        }
    </div>
  )
}

export default Publicaciones