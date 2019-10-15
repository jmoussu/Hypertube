import React, { useState, useContext } from 'react';
import { Store } from '../../store';
import NotFound from '../404';
import { navigate } from '@reach/router';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import SearchIcon from '@material-ui/icons/Search';
import trans from "./../../translate";
import ClassesUi from "./../ClassesUi";

export default function CatalagueBar(props) {
	const classes = ClassesUi();
	const { displayData, activeTab, loader } = props;
	const [val, setVal] = useState('');
	const { state } = useContext(Store);

	function research(e) {
		e.preventDefault();
		displayData('search', val);
	}

	if (!state.login) {
		return (<NotFound />)
	} else {
		if (!state.complete) {
			return navigate('/profil')
		} else {
			return (
				<div className='catalogue-bar'>
					{/* <button id='popular' onClick={() => displayData('popular')}>Most popular</button>
					<button id='lastadded' className='button' onClick={() => displayData('lastadded')}>Last added</button>
					<button id='random' className='button' onClick={() => displayData('random')}>Random</button> */}
					<form onSubmit={research}>
						<div id='div-searchBar' className={classes.search}>
							<div className={classes.searchIcon}>
								<SearchIcon />
							</div>
							<InputBase
							placeholder={trans.library.menu.search[state.lang]+"..."}
								classes={{
									root: classes.inputRoot,
									input: classes.inputInput,
								}}
								inputProps={{ 'aria-label': 'search' }}
								onChange={(e) => setVal(e.target.value)}
							/>
						</div>
					</form>
					<Grid item >
						<ButtonGroup fullWidth color="primary" aria-label="outlined primary button group">
							<Button
								id='popular'
								variant={activeTab === 'popular' ? 'contained' : 'outlined'}
								onClick={() => loader ? loader: displayData('popular')}
							>
								{trans.library.menu.popular[state.lang]}
							</Button>
							<Button
								variant={activeTab === 'lastadded' ? 'contained' : 'outlined'}
								id='lastadded'
								className='button'
								onClick={() => loader ? loader: displayData('lastadded')}
							>
								{trans.library.menu.lastadded[state.lang]}
							</Button>
							<Button
								variant={activeTab === 'random' ? 'contained' : 'outlined'}
								id='random'
								className='button'
								onClick={() => loader ? loader:displayData('random')}
							>
								{trans.library.menu.random[state.lang]}
							</Button>	
						</ButtonGroup>
					</Grid>
				</div>
			);
		}
	}
}
