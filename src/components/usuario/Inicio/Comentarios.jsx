import { addDoc, collection, getDocs, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import React from 'react'
import { ChatContext } from '../../../context/UsuarioProvider';
import { db } from '../../../firebase';
import moment from 'moment';

export default function Comentarios(props) {
    const {usuario} = React.useContext(ChatContext);
    const [comentario, setComentario] = React.useState('');
    const [comentarios, setComentarios] = React.useState([]);

    React.useEffect(()=>{
        traerComentarios();
    },[]);
    
    const traerComentarios = async() => {
        const q = query(
            collection(db, 'comentarios'),
            where('publicacionId', '==', props.id),
        )

        onSnapshot(
            q,
            query => {
                const arrayComentarios = query.docs.map(item => ({id: item.id, ...item.data()}));
                setComentarios(arrayComentarios);
            }
        );
    }

    const enviarComentario = async(e) => {
        e.preventDefault();

        if (!comentario) {
            return;
        }

        let fecha = moment().format('LLL')
        
        await addDoc(collection(db, 'comentarios'), {
            publicacionId: props.id,
            uid: usuario.uid,
            nombre: usuario.nombre,
            comentario: comentario,
            fecha: fecha
        })

        setComentario('');
    }

  return (
    <div className="mt-3">
        {
            comentarios.map((item, index) =>
                <div className="card mb-3 ms-3 me-3 border border-success bg-dark text-light" key={index}>
                    <div className="card-header border-bottom border-success">
                     <b className='float-start'>{item.nombre}</b>
                     <div className="float-end">{item.fecha}</div>
                    </div>
                    <div className="card-body">
                        <p>{item.comentario}</p>
                    </div>
                </div>
            )
            
        }

        <form onSubmit={enviarComentario} className='input-group mt-2 my-3'>
            <input type="text" className='form-control' value={comentario} onChange={e => setComentario(e.target.value)}/>
            <button type="submit" className='btn btn-success'>
                Enviar
            </button>
        </form>
    </div>
  )
}
