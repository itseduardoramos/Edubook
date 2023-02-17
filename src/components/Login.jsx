import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ChatContext } from '../context/UsuarioProvider'

const Login = () => {
  const myContext = React.useContext(ChatContext);
  const navegar = useNavigate();

  const Ingresar = () => {
    if (myContext.ingresarUsuario() == 1) {
        navegar("/perfil");
    }
  }

  return (
    <div className="row bg-white text-dark">
        <div className="col-md-8 mt-5">
            <h1 className="text-success text-left">Edubook</h1>
            <h3 className="text-left">Conéctate con gente de todo el mundo y conoce todas las posibilidades con Edubook.</h3>
            <img src="https://previews.123rf.com/images/denchik/denchik1601/denchik160100017/51568432-polygonal-gray-background-vector-illustration-technology-design.jpg" 
            width="100%"/>
        </div>
        <div className="col-md-4 mt-5 border shadow-lg p-3 mb-5 bg-white rounded">
            <h3 className="text-center">Bienvenido a Edubook</h3>
            <h5>Eduardo Ramos:</h5>
            <p className='mt-3'>Hola, soy Edurado Misael Ramos Peña, el desarrollador de Edubook, disfruta tu estancia.</p>
                    
            <div className="d-grid gap-2">
                <button className="btn btn-success btn-lg btn-block" type="submit">
                    Mira mis proyetos en GitHub
                </button>

                <button className="btn btn-danger btn-lg btn-block" type="button" onClick={() => Ingresar()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="40px" fill="currentColor" className="bi bi-google float-start" viewBox="0 0 16 16">
                        <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z"/>
                    </svg>
                    <p>Iniciar sesión con Google</p>
                </button>
                        
                </div>
        </div>
     </div>
  )
}

export default Login