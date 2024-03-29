import React from "react";
import { Routes, Route, HashRouter } from 'react-router-dom';
import Home from "./views/home";

const App = () => {
	return (
		<div>
			<HashRouter>
				<Routes>
					<Route path="/" exact  element={ <Home /> }  />
				</Routes>
			</HashRouter>
		</div>
	);
}

export default App;