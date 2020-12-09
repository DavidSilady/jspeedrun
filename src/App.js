import './App.css';
import {BrowserRouter, Switch, Route, Link} from 'react-router-dom'
import {AdminPage} from "./Components/AdminPage";
import {HomePage} from "./Components/HomePage";

function App() {
  return (
      <BrowserRouter>
          <Switch>
              <Route path={'/admin'} component={AdminPage}/>
              <Route path={'/'} component={HomePage}/>
          </Switch>
      </BrowserRouter>
  );
}

export default App;
