import React from 'react'
import { ChatContext } from '../../../context/UsuarioProvider';
import { NavLink } from 'react-router-dom';
import { auth, db, storage } from '../../../firebase';
import { useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import SubirPublicacion from '../Inicio/SubirPublicacion';
import Publicaciones from '../Publicaciones';
import BotonPerfil from '../BotonPerfil';

const Perfil = () => {
  const {usuario, setUsuario} = React.useContext(ChatContext)
  const navegar = useNavigate();
  const [activarFormulario, setActivarFormulario] = React.useState(false);
  const [nuevoNombre, setNuevoNombre] = React.useState('');

  React.useEffect(()=>{
    if (!auth.currentUser) {
      navegar("/")
    }
  },[navegar])

  const actualizarFotoPerfil = async(infoImagen) => {
    if (!infoImagen) {
      return;
    }

    const imagen = infoImagen.target.files[0];
    const metadata = { contentType: 'image/jpeg' };
    let urlFoto;

    try {
      const imagenRef = ref(storage, `imagenes/${usuario.uid}`);
      await uploadBytesResumable(imagenRef, imagen, metadata);
      await getDownloadURL(ref(storage, `imagenes/${usuario.uid}`)).then((url) => {urlFoto = url;}).catch((error) => {/* Handle any errors */});
      await updateDoc(doc(db, 'usuarios', usuario.uid), {fotoPerfil: urlFoto})

    } catch (error) {
      console.log(error);
    }

    actualizarUsuario();
  }

  const actualizarNombre = async() => {
    if (!nuevoNombre) {
      return;
    }

    try {
      await updateDoc(doc(db, 'usuarios', usuario.uid), {nombre: nuevoNombre})
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
        <div className="col-md-3 border-end border-success">
          <BotonPerfil />
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
                <input type="file" id="cambiarFoto" onChange={e => actualizarFotoPerfil(e)} hidden />
                
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
            <Publicaciones uid={usuario.uid}/>
          </div>
        </div>

      </div>
  )
}

export default Perfil