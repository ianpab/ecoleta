import React from 'react'; // useState para alterar estados
import './App.css';

import Routes from './routes';

function App() {
  return (
    <Routes />
  );
}

export default App;








/* import Header from './Header';

function App() {
const [ counter, setCounter] = useState(0);// useState [ valor, funcao]
  function buttonClick(){
    setCounter(counter + 1);
  }

  return (
      <div>
        <Header title="Titulo da app"/>
        <h1>Conteudo da app</h1>
        <h2>{counter} </h2>
        <h2>{counter * 2 } </h2>
        <button onClick={buttonClick}>Aumentar</button>
      </div>
    );
} */