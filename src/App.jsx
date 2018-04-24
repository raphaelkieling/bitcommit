import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid'
import Home from './views/Home';
import { HashRouter, Route, Router,Switch } from 'react-router-dom';

class App extends Component {

  render() {
    return (
      <Row>
        <Col xs={12}>
          <Row center="xs">
            <Col xs={12} md={6}>
              <Home/>
            </Col>
          </Row>
        </Col>
      </Row>
    );
  }
}

export default App;
