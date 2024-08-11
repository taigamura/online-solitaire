import './App.css';
import React, { Component } from 'react';

// class based component
class Play extends Component {
    constructor() {
        super()

        this.state = {
            files: [],
            deckShow: false
        }
    }

    render() {
        return (
            <div>
                <h3>カードを追加</h3>
            </div>
        );
    }
}

export default Play;