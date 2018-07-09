import React, { Component } from 'react';

export default class ResultCard extends Component {
    render() {
        let {texto_decisao, assunto, orgao_julgador, origem, julgador} = this.props
        return(
            <div className='result-card'> 
                <div className='result-header'>
                    <div className='result-subject'> {assunto} </div>
                    <div className='result-subject' style={{textAlign: 'right'}}> {orgao_julgador} </div>
                </div>
                
                <div className='result-header'>
                    <div className='result-subject'> {origem} </div>
                    <div className='result-subject'> {julgador} </div>
                </div>

                <div style={{textAlign: 'justify', whiteSpace: 'pre-line'}}> {texto_decisao ? texto_decisao : "NADA"} </div>
            </div>
        )
    }
}