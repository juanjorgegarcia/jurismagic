import React, { Component } from 'react';

import './App.css';
import { TextField, Icon, InputAdornment, Button} from '@material-ui/core'
import ResultCard from './components/ResultCard'

const ISLOCAL = true
const remoteIp = 'http://18.207.30.129'

class App extends Component {
  constructor(props) {
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

    let url = ISLOCAL ? `q?${params}` : `${remoteIp}/q?${params}`
    console.log(url)
    let res = await fetch(url, {
      method: 'get'
    })

    res = await res.json()
    console.log(res)
    this.setState({ results: res })
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
        {this.state.results && this.state.query !== "" ? <p>Foram encontrados {this.state.results.length} documentos </p> : null}

        {this.state.results
          ? this.state.results.map((r, i) => <ResultCard key={'result' + i} {...r} />)
          : null
        }
        {this.state.results instanceof Array && this.state.results.length === 0 ? <p> Nenhum documento foi encontrado. </p> : null}

      </div>
    );
  }
}

export default App;
