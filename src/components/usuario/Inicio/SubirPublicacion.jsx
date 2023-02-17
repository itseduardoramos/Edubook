import React from 'react'
import moment from 'moment';
import { ChatContext } from '../../../context/UsuarioProvider';
import { addDoc, collection } from 'firebase/firestore';
import { db, storage } from '../../../firebase';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';

function SubirPublicacion() {
    const [publicacion, setPublicacion] = React.useState('');
    const {usuario} = React.useContext(ChatContext);
    const [fotoPublicacion, setFotoPublicacion] = React.useState();

    const subirPublicacion = async(e) => {
        e.preventDefault();
    
        if (!publicacion && !fotoPublicacion) {
          return;
        }
        const fecha = moment().format('LLL');
        var post = {
                    uid: usuario.uid, 
                    texto: publicacion, 
                    fecha: fecha,
                    likes: 0
                };

        if (fotoPublicacion) {
          const url = await subirFotoPublicacion(fotoPublicacion);
          post.foto = url;
        }

        await addDoc(collection(db, 'publicaciones'), post);
    
        setFotoPublicacion('');
        setPublicacion('');
    }

    const subirFotoPublicacion = async (infoImagen) => {
        if (!infoImagen) {
          return;
        }

        const formato = infoImagen.target.files[0].type;
    
        const imagen = infoImagen.target.files[0];
        const metadata = {
          contentType: formato
        };

        const nombre = infoImagen.target.files[0].name;

        let urlFoto;
    
        try {
          const imagenRef = ref(storage, `publicaciones/${usuario.uid}/${nombre}`);
          await uploadBytesResumable(imagenRef, imagen, metadata);
    
          await getDownloadURL(ref(storage, `publicaciones/${usuario.uid}/${nombre}`))
            .then((url) => {
              urlFoto = url
            })
            .catch((error) => {
              // Handle any errors
            });

            return urlFoto
    
        } catch (error) {
          console.log(error);
        }
      }

  return (
    <div className="card ms-3 me-3 mt-3 bg-dark">
        <form onSubmit={subirPublicacion} >
            <div className="d-grid gap-2">
                <textarea placeholder='¿Qué estás pensando?' value={publicacion} onChange={e => setPublicacion(e.target.value)} />
                <label htmlFor="files" className='btn btn-success'>Adjuntar imagen</label>
                <input type="file" id="files" hidden onChange={e => setFotoPublicacion(e)} />
                {
                fotoPublicacion && (
                    <div className='alert alert-success'>Imagen agregada</div>
                )
                }
                <button type='submit' className='btn btn-dark btn-md btn-block' >Publicar</button>
            </div>
        </form>
    </div>
  )
}

export default SubirPublicacion