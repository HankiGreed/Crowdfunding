import React, {Component} from 'react';
import './App.css';
import {Router, Switch, Route} from 'react-router-dom';
import NotFound from './Components/NotFound';
import Campaign from './Components/Campaign';
import {Menu, Container} from 'semantic-ui-react';
import history from './history';
import 'semantic-ui-css/semantic.min.css';
import Home from './Components/Home';

class App extends Component {
  navigateToHome = (e) => {
    e.preventDefault();
    history.push('/');
  };

  render() {
    return (
      <Router history={history}>
        <Container>
          <Menu>
            <Menu.Item name="Home" onClick={this.navigateToHome} />
          </Menu>
          <Switch>
            <Route exact path="/">
              <Home />
            </Route>

            <Route exact path="/campaign/:address" component={Campaign} />

            <Route>
              <NotFound />
            </Route>
          </Switch>
        </Container>
      </Router>
    );
  }
}

export default App;
