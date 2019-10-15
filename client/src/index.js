import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from '@reach/router';
import { SnackbarProvider } from 'notistack';
import { MuiThemeProvider } from '@material-ui/core';
import { Activate } from './pages/Auth/Register.js';
import { StoreProvider } from './store';
import { createHypertubeTheme } from './app/theme';

import Account from './pages/Account';
import EditPass from './pages/EditPass';
import Home from './pages/Home/index';
import NotFound from './pages/404';
import Profile from './pages/Profile';
import Movie from './pages/Movie/index';
import Layout from './Layout';


ReactDOM.render(
	<MuiThemeProvider theme={createHypertubeTheme()} >
		<StoreProvider>
			<SnackbarProvider maxSnack={3}>
			<Layout>
				<Router>
					<Home path='/' />
					<Account path='/profil' />
					<Movie path='/film/:imdb' />
					<EditPass path='/motdepasse/:token' />
					<Activate path='/activer/:token' />
					<Profile path='/membres/:username' />
					<NotFound default />
				</Router>
			</Layout>
			</SnackbarProvider>
		</StoreProvider>
	</MuiThemeProvider >,
	document.getElementById('root'));
