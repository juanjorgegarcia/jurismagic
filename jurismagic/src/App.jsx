import React, { Component } from 'react';

import openSocket from 'socket.io-client';
import './App.css';
import { TextField, Icon, InputAdornment, Button } from '@material-ui/core'
import ResultCard from './components/ResultCard'
import {Api} from './helpers/api'


const ISLOCAL = true
const remoteIp = 'http://18.207.30.129'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      query: "",
      results: null,
      docsSize: null,
      download: false
    }
    this.socket = openSocket('localhost:5000');

    // this.setState({docsSize:countDocs()})
    // // this.updateDocsCount= () = {
    // //   this.setState({docsSize:countDocs()})
    // // }
  }

  componentWillMount() {
    // this.socket.on('alerta', (dado) => {
    //   console.log(dado)
    // })

    this.socket.on('count', (data) => {
      this.setState({docsSize: data[0]["@rows"]})
    })

    this.socket.on('comecou', (dado) => {
      console.log(dado)
    })

    this.socket.on('download', (dado) => {
      console.log(dado)
      this.setState({download: true})
    })
    
  }

  componentDidMount() {
    Api.query('esse é o texto da query', (resultado) => {
      console.log(resultado)
    })
  }

  onQuerySubmit = async () => {
    if (this.state.query === '') {
      return false
    }

    let params = new URLSearchParams(Object.entries({
      text: this.state.query
    }))

    let url = ISLOCAL ? `q?${params}` : `${remoteIp}/q?${params}`

    console.log(url)

    let res = await fetch(url, {
      method: 'get'
    })

    res = await res.json()
    // console.log(resCount)
    this.setState({ results: res })
    this.getRowCount()
  }

  getRowCount = async () => {
    if (this.state.query === '') {
      return false
    }

    let params = new URLSearchParams(Object.entries({
      text: this.state.query
    }))



    let urlSize = ISLOCAL ? `count?${params}` : `${remoteIp}/count?${params}`
    // console.log(urlSize)
    let resCount = await fetch(urlSize, {
      method: 'get'
    })

    resCount = await resCount.json()

    // console.log(resCount)
    this.setState({ docsSize: resCount[0][["@rows"]] })

  }

  // countDocs = (data) => {
  //   this.setState({ docsSize: data })
  // }



  onDownload = async () => {
    if (this.state.query === '') {
      return false
    }

    let params = new URLSearchParams(Object.entries({
      text: this.state.query
    }))

    let url = ISLOCAL ? `download?${params}` : `${remoteIp}/download?${params}`
    console.log(url)
    let res = await fetch(url, {
      method: 'get'
    })

    // this.setState({ download: true })
  }

  // getFile = async () => {
  //   if (this.state.query === '') {
  //     return false
  //   }

  //   let params = new URLSearchParams(Object.entries({
  //     text: this.state.query
  //   }))

  //   let url = ISLOCAL ? `/d` : `${remoteIp}/d`
  //   console.log(url)
  //   let res = await fetch(url, {
  //     method: 'get'
  //   })

  //   this.setState({ files: res })


  // }

  onChildClicked = (id) => {
    console.log('O ID ' + id + ' CLICOU' )
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title"> JurisMagic </h1>
        </header>

        <TextField
          id="search"
          label="Search field"
          type="search"
          margin="normal"
          value={this.state.query}
          fullWidth={true}
          style={{ width: '80%' }}
          onChange={(ev) => {
            this.setState({ query: ev.target.value })
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon>search</Icon>
              </InputAdornment>
            ),
          }}
        />
        <br />
        <Button variant="contained" color="primary" onClick={this.onQuerySubmit}>
          Pesquisar
        <Icon style={{ marginLeft: 5 }}>send</Icon>
        </Button>
        <Button className="Download-Button" style={{ marginLeft: "2%" }} variant="contained" color="primary" onClick={this.onDownload}>
          Produzir Arquivos
        <Icon style={{ marginLeft: 5 }} >archive</Icon>
        </Button>
        {/* <p>Foram encontrados {this.state.docsSize} documentos </p> */}
        {this.state.docsSize && this.state.results && this.state.query !== "" ? <p>Foram encontrados {this.state.docsSize} documentos </p> : null}
        {this.state.download ? <a href={"/data/" + this.state.query + '.zip'} download={"/data/" + this.state.query + '.zip'}>Click to Download </a> : null}
        {this.state.results
          ? this.state.results.map((r, i) => <ResultCard onClick={this.onChildClicked} key={'result' + i} {...r} />)
          : null
        }
        {/* <Button className = "Download-Button" style={{ marginLeft: "2%" }}variant="contained" color="primary" onClick={this.getFiles}>
          VER ARQUIVOS
        <Icon style={{ marginLeft: 5 }} >archive</Icon>
        </Button> */}
        {/* <p>{this.state.files}</p> */}
        {this.state.results instanceof Array && this.state.results.length === 0 ? <p> Nenhum documento foi encontrado. </p> : null}
      </div>
    );
  }
}

export default App;
