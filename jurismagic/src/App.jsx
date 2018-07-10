import React, { Component } from 'react';

import './App.css';
import { TextField, Icon, InputAdornment, Button } from '@material-ui/core'

class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      query: "",
      results: null
    }
  }

  
  onQuerySubmit = async () => {
    if (this.state.query === '') {
      return false
    }
    
    let params = new URLSearchParams(Object.entries({
      text: this.state.query
    }))

    let res = await fetch('18.207.30.129/q?'+params, {
      method: 'get'
    })

    res = await res.json()
    this.setState({ results: res })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title"> JurisMagic </h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>

        <TextField
          id="search"
          label="Search field"
          type="search"
          margin="normal"
          value={this.state.query}
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
      <br/>
      <Button variant="contained" color="primary" onClick={this.onQuerySubmit}>
        Pesquisar
        <Icon style={{marginLeft: 5}}>send</Icon>
      </Button>

      {this.state.results
        ? this.state.results.map((r,i) => <p key={'result'+i}> {r.texto_decisao} </p>)
        : null
      }

      {this.state.results instanceof Array && this.state.results.length === 0 ? <p> Nenhum documento foi encontrado. </p> : null} 

      </div>
    );
  }
}

export default App;
