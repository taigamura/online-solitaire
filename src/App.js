import './App.css';
import Draggable from 'react-draggable'
import React, { Component } from 'react';

// class based component
class App extends Component {
  
  state = {
    files: []
  }

  deckShow = false

  handleChange = (e) => {
    this.setState({ files: [...this.state.files, ...e.target.files] }, () => {
      console.log(this.state)
    })
  }

  handleSubmit = (e) => {
    // reloads page for some reason default
    e.preventDefault();
    this.deckShow = true
    console.log(this.deckShow)
    console.log(e)
  }

  handleReset = (e) => {
    this.deckShow = false
    this.state.files = []
  }

  render () {
    return (
      <div>
        <h3>カードを追加</h3>
        <input type="file" multiple onChange={this.handleChange} />
        
        <Draggable>
          <div className="App">
            {/* デュエマは 63mm x 88mm */}
            {this.state.files.map( (file, index) => (
              <div>
                <img src={URL.createObjectURL(file)} width="157.5" height="220" alt="error" />
                <input type="number" id={index} name="number"/>
              </div>
            ))}
          </div>
        </Draggable>
        
        <form onSubmit={this.handleSubmit}>
          <button type = 'submit'>カード枚数確定</button>
        </form>

        <form onSubmit={this.handleReset}>
          <button type = 'submit'>リセット</button>
        </form>

      </div>
    );
  }
}

export default App;