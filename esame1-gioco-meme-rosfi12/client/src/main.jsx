import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App.jsx'
import './index.css'

// React Strict Mode è uno strumento di sviluppo per evidenziare potenziali problemi nell'applicazione React. 
// Quando è attivato, avvolge il componente o l'albero dei componenti e aiuta a identificare parti del codice che potrebbero causare problemi futuri. 
// Non ha alcun impatto sulla produzione, è solo per lo sviluppo.
// Quando utilizzi React.StrictMode con createBrowserRouter, esso avvolge il componente RouterProvider, 
// attivando tutte le verifiche e gli avvertimenti forniti da StrictMode per il routing e i componenti figlio. 
// Questo significa che eventuali problemi o avvisi relativi alle pratiche di codifica deprecate, ai cicli di vita del componente non sicuri 
// o agli effetti collaterali non intenzionali saranno segnalati durante lo sviluppo.
const router = createBrowserRouter([{path: "/*", element: <App/>}]);
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);

