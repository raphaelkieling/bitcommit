import React, { Component } from 'react'
import { Button } from 'react-materialize';
import { Row } from 'react-flexbox-grid';

export default class Login extends Component {
    constructor(props) {
        super();
    }
    render() {
        let { entrar } = this.props;
        return (
            <Row center="xs">
                <Button waves='light' onClick={() => entrar()}>Entrar</Button>
            </Row>
        )
    }
}
