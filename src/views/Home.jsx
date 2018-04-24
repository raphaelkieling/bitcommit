import React, { Component } from 'react'
import { Button, Input, Icon, Preloader, Card, Collection, CollectionItem } from 'react-materialize';
import axios from 'axios';
import Login from '../common/Login';
import { Style } from './style';
import { Row, Col } from 'react-flexbox-grid'
import Moment from 'moment';
import { extendMoment } from 'moment-range';

const moment = extendMoment(Moment);

export default class Home extends Component {
    constructor(props) {
        super(props);

        this.state = {
            nameRepo: '',
            logged: false,
            contentEmail: '',
            username: '',
            loadCommits: false,
            to:'',
            subject: `Feitos do dia ${moment().format('DD/MM/YYYY')}`
        };

        this.loginBitBucket.bind(this);
        this.commitsRepositorio.bind(this);
        this.filterByUsername.bind(this);
        this.getUsername.bind(this);
        this.sendEmail.bind(this)
    }

    async componentDidMount() {
        let key = this.getTokenFromURL();

        if (!key) {
            return;
        }

        sessionStorage.setItem('__token', key);
        let username =await  this.getUsername();
        this.setState({ logged: true, username })
    }

    client() {
        return axios.create({
            baseURL: `https://api.bitbucket.org/2.0`,
            headers: { 'Authorization': `Bearer ${sessionStorage.getItem('__token')}` }
        });
    }

    async commitsRepositorio() {
        this.setState({loadCommits:true})
        await this.client()
            .get(`/repositories/infoworld/${this.state.nameRepo}/commits`)
            .then(res => res.data.values)
            .then(res => this.filterByUsername(res))
            .then(res => this.filterDateCommits(1)(res))
            .then(res => this.getPropsCommit(res))
            .then(res=> this.setEmailContent(res))
            .then(contentEmail => this.setState({ contentEmail }))

        this.setState({loadCommits:false})            
    }

    async getUsername() {
        return await this.client()
            .get('/user')
            .then(res => res.data.display_name)
    }

    setEmailContent(commits) {
        console.log(commits);
        let content = `Segue todas as tarefas desenvolvidas durante o dia \n`;
        return commits.reduce((antes, atual) => {
            return antes += `> ${atual.message}\n`
        }, content);
    }

    sendEmail(){
        window.open(`mailto:${this.state.to}?subject=${this.state.subject}&body=${encodeURI(this.state.contentEmail)}`);
    }

    filterByUsername(commits) {
        return commits.filter((commit) => {
            return commit.author.raw.toLowerCase().includes(this.state.username.split(' ')[0].toLowerCase())
        });
    }

    getPropsCommit(commits) {
        console.log(commits)
        return commits.map((commit) => {
            return {
                message: commit.message,
                author: commit.author.raw,
                hash: commit.hash,
                date: commit.date
            }
        })
    }

    filterDateCommits(numberDays) {
        return (commits) => {
            return commits.filter((commit) => {
                let now = moment();
                let endDate = moment().subtract(numberDays, 'days');
                let commitDate = moment(commit.date);
                let range = moment().range(endDate, now);

                return range.contains(commitDate)
            });
        }
    }

    loginBitBucket() {
        window.location =
            `https://bitbucket.org/site/oauth2/authorize?client_id=YcXq8JHaLhxJKfkaJ8&response_type=token`;
    }

    handleKey(e) {
        this.setState({
            [e.target.name]: e.target.value
        });
    }

    getTokenFromURL() {
        let params = window.location.hash.split('&');
        let key = null;
        if (params.length > 0 && params[0].startsWith('#access_token=')) {
            key = decodeURIComponent(params[0].replace('#access_token=', ''));
        }

        return key;
    }

    render() {
        const logo = require('../logo.png');
        let { nameRepo, logged,contentEmail,to,subject,loadCommits,username } = this.state;
        return (
            <div>
                <img style={Style.home.image} src={logo} alt="logo bitbucket" />
                <p style={Style.home.title}> {username} </p>
                {
                    logged
                        ?
                        <div>
                            <Card>
                                <Input name="nameRepo" placeholder="Repositório" s={12} value={nameRepo} label="Nome do repositório" onChange={this.handleKey.bind(this)} />
                                <Button style={Style.home.primaryColor} waves='light' onClick={() => this.commitsRepositorio()}>Pesquisar</Button>
                            </Card>

                            {
                                loadCommits 
                                ? <Preloader size='big'/>
                                :  
                                <Card>
                                    <Row xs={12}>
                                        <Input name="to"  value={to} s={12} label="Para" onChange={this.handleKey.bind(this)}/>
                                        <Input name="subject" value={subject} s={12} label="Assunto" onChange={this.handleKey.bind(this)}/>
                                    </Row>
                                    <Row xs={12}>
                                        <Input name="contentEmail" value={contentEmail} row={10} type='textarea' s={12} label="Conteúdo do e-mail" onChange={this.handleKey.bind(this)}/>
                                    </Row>
                                    <Button style={Style.home.primaryColor} waves='light' onClick={() => this.sendEmail()}>
                                        <Icon>email</Icon>
                                    </Button>
                                </Card>
                            }
                        </div>
                        : <Login entrar={this.loginBitBucket} />
                }

            </div>
        )
    }
}
