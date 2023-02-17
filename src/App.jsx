import React from 'react';
import Login from './components/Login';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import Perfil from './components/usuario/Perfil/Perfil';
import Amigos from './components/usuario/Perfil/Amigos';
import Configuracion from './components/usuario/Perfil/Configuracion';
import Mensajes from './components/usuario/Mensajes/Mensajes';
import Inicio from './components/usuario/Inicio/Inicio';
import Navbar from './components/Navbar';
import { ChatContext } from './context/UsuarioProvider';

function App() {

  const {usuario} = React.useContext(ChatContext)

  return usuario !== false ? (
    <div className="container-fluid bg-dark text-light">

      <Router>
      <div>
        {
          usuario.estado && (<Navbar />)
        }
        
      </div>
        <Routes>
          <Route path="/" element={<Login />} />

          {/* RUTAS DEL APARTADO PERFIL */}
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/amigos" element={<Amigos />} />
          <Route path="/configuracion" element={<Configuracion />} />

          {/* RUTAS DEL APARTADO INICIO */}
          <Route path="/inicio" element={<Inicio />} />

          {/* RUTAS DEL APARTADO MENSAJES */}
          <Route path="/mensajes" element={< Mensajes/>} />
        </Routes>
      </Router>
    </div>
  ) :
  (
    <div className="App">
      Cargando...
    </div>
  )
}

export default App;
