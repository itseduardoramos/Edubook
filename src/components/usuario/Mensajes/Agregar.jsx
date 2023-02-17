import React from 'react'
import { ChatContext } from '../../../context/UsuarioProvider'

const Agregar = (props) => {
    const {usuario} = React.useContext(ChatContext)
    const [mensaje, setMensaje] = React.useState('') 

    const agregar = (e) => {
      e.preventDefault()

      props.mandarMensaje(mensaje, props.amigoId);
      setMensaje('');
    }
     
  return (
    <div className="bg-dark">
      <form className="bottom-0 bg-dark" onSubmit={agregar}>
        <input type="text" className="form-control" value={mensaje} onChange={e => setMensaje(e.target.value)} />
        <div className="input-group-append py-3">
            <button className="btn btn-success" type="submit">Enviar</button>
        </div>
      </form>
    </div>
  )
}

export default Agregar