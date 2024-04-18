import React from "react";
import { Routes, Route, HashRouter } from 'react-router-dom';
import Home from "./views/home";
import FolderView from "./views/folderView";
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
	return (
		<div>
			<HashRouter>
				<Routes>
					<Route path="/" exact  element={ <Home /> }  />
					<Route path="/folder/:folderName"   element={ <FolderView /> }  />
				</Routes>
			</HashRouter>
		</div>
	);
}

export default App;