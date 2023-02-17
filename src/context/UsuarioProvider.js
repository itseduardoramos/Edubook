import React from "react";
import { auth, provider, db } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { setDoc, doc, getDoc, onSnapshot } from 'firebase/firestore';

export const ChatContext = React.createContext()

const ChatProvider = (props) => {

    const  dataUsuario = {uid: null, nombre:null, foto: null, email: null, estado: false};
    const [usuario, setUsuario] = React.useState(dataUsuario);
    
    React.useEffect(() => {
        detectarUsuario();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const detectarUsuario = (uid, nombre, foto, email, estado) => {


        if (localStorage.getItem('usuario')) {
            const usuarioInfo = JSON.parse(localStorage.getItem('usuario'));

            setUsuario({uid: usuarioInfo.uid, nombre: usuarioInfo.nombre, fotoPerfil: usuarioInfo.fotoPerfil, email: usuarioInfo.email, estado: usuarioInfo.estado});

        }
        else{
            setUsuario({uid: null, nombre: null, fotoPerfil: null, email: null, estado: false})
        }
        //CON EL OBSERVARDOR USER VERIFICO SI ENTRA O SALE EL USUARIO
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setUsuario({uid: uid, nombre: nombre, fotoPerfil: foto, email: email, estado: estado});
                
            }else{
                setUsuario({uid: null, nombre: null, fotoPerfil: null, email: null, estado: false})
            }
        });
    }

    const ingresarUsuario = async() => {
        try {
            const res = await signInWithPopup(auth, provider);
            const respuesta = await getDoc(doc(db, 'usuarios', res.user.uid));
            const usuarioInfo = respuesta.data();

            if(!respuesta.exists()){
                setDoc(doc(db, 'usuarios', res.user.uid), {
                    uid: res.user.uid,
                    nombre: res.user.displayName,
                    fotoPerfil: res.user.photoURL,
                    email: res.user.email,
                    estado: true
                });

            }else{
                detectarUsuario(usuarioInfo.uid, usuarioInfo.nombre, usuarioInfo.fotoPerfil, usuarioInfo.email, usuarioInfo.estado);
            }

            localStorage.setItem('usuario', JSON.stringify(usuarioInfo));

            return 1;

        } catch (error) {
            console.log(error)
        }
    }

    const cerrarSesion = () => {
        localStorage.removeItem('usuario');
        signOut(auth);
        return 1;
    }
    
    return (
        <ChatContext.Provider value={{usuario, setUsuario, ingresarUsuario, cerrarSesion}}>
            {props.children}
        </ChatContext.Provider>
    )
    
}

export default ChatProvider