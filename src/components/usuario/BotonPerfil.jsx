import React from 'react'
import { NavLink } from 'react-router-dom';
import { ChatContext } from '../../context/UsuarioProvider';

const BotonPerfil = () => {
    const {usuario} = React.useContext(ChatContext);

  return (
    <button className="btn btn-dark text-start w-100 mt-3">
      <NavLink to="/perfil" className="text-white text-decoration-none">
        <img src={usuario.fotoPerfil} className='img-fluid float-start rounded-circle me-2' width='64px' />
        <p className='ms-5 mt-3 py-2 text-white text-start'>{usuario.nombre}</p>
      </NavLink>
    </button>
  )
}

export default BotonPerfil