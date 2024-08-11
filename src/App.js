import './App.css';
import Draggable from 'react-draggable'
import React, { Component } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import Play from './Play';

// class based component
class App extends Component {
	constructor() {
		super()

		this.state = {
			files: [],
			deckShow: false
		}
	}

	handleChange = (e) => {
		this.setState({ files: [...this.state.files, ...e.target.files] }, () => {
			this.state.files.forEach((e) => {
				e.number = 1
			})
			this.forceUpdate()
		})
	}

	handleSubmit = (e) => {
		// reloads page for some reason default
		e.preventDefault();
		this.setState({ deckShow: true })
	}

	handleReset = (e) => {
		this.setState({ deckShow: false })
		this.setState({ files: [] })
	}

	handleNumberChange = (e) => {

		this.setState(({ files }) => ({
			...files[e.target.id].number = parseInt(e.target.value)
		}))

		console.log(this.state)
	}

	handleRedirect = (e) => {
		const navigate = useNavigate()
		e.preventDefault();
		navigate("/play")
	}

	render() {
		return (
			<div>
				<h3>カードを追加</h3>
				<input type="file" multiple onChange={this.handleChange} />

				<Draggable>
					<div className="App">
						{/* デュエマは 63mm x 88mm */}
						{this.state.files.map((file, index) => (
							<div>
								<img src={URL.createObjectURL(file)} width="157.5" height="220" alt="error" />
								<select id={index} placeholder={file.number} onChange={this.handleNumberChange}>
									<option value="1">1</option>
									<option value="2">2</option>
									<option value="3">3</option>
									<option value="4">4</option>
								</select>
							</div>
						))}
					</div>
				</Draggable>

				<form onSubmit={this.handleSubmit}>
					<button type='submit'>カード枚数確定</button>
				</form>

				<form onSubmit={this.handleReset}>
					<button type='submit'>リセット</button>
				</form>

				{this.state.deckShow && <div>
					{this.state.files.map((file, index) => (
						[...Array(file.number)].map(() => (
							<div>
								<img src={URL.createObjectURL(file)} width="157.5" height="220" alt="error" />
							</div>
						))
					))}

					<form onSubmit={this.handleRedirect}>
						<button type='submit'>デッキ確定</button>
					</form>
				</div>}

				<BrowserRouter>
					<Routes>
						<Route exact={true} path="/play" component={Play} />
					</Routes>
				</BrowserRouter>

			</div>
		);
	}
}

export default App;