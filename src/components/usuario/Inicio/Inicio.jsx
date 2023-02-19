import React from 'react';
import { auth } from '../../../firebase';
import { useNavigate } from 'react-router-dom';
import { ChatContext } from '../../../context/UsuarioProvider';
import SubirPublicacion from './SubirPublicacion';
import Publicaciones from '../Publicaciones';
import BotonPerfil from '../BotonPerfil';

const Inicio = () => {
  const navegar = useNavigate();
  const {usuario} = React.useContext(ChatContext);

  React.useEffect(()=>{
    if (!auth.currentUser) {
      navegar("/");
    }
  }, [navegar]);

  return (
      <div className="row">
        <div className="col-md-3 border-end border-success">
          <BotonPerfil />

        </div>
        <div className="col-md-9">
          <SubirPublicacion />
          <Publicaciones/>
        </div>
      </div>
  )
}

export default Inicio