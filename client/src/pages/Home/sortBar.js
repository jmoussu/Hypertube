import React, { useState, useEffect } from 'react';
import Slider from '@material-ui/core/Slider';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import trans from "./../../translate";
import ClassesUi from "./../ClassesUi";


export default function SortBar(props) {
	const classes = ClassesUi();
	const { state } = props;
	const [genders, setGenders] = useState([]);
	const sorts = ['name', 'year', 'ratings'];
	const setTmp = props.tmp;
	const { movies, filters, setFilters, sort, setSort } = props;
	const [syear, setSyear] = useState([1900, 2019]);
	const [srate, setSrate] = useState([0, 100]);

	useEffect(() => {
		if (filters && filters.year && filters.year.value)
			setSyear(filters.year.value);
		else
			setSyear([1900, 2019]);
		if (filters && filters.ratings && filters.ratings.value)
			setSrate(filters.ratings.value);
		else
			setSrate([0, 100]);
	}, [filters])

	useEffect(() => {
		function getGenders() {
			let tmpG = [];
			movies.forEach(e => e.genre.forEach(f => {
				if (!tmpG.includes(f))
					tmpG.push(f)
			}));
			return tmpG;
		}
		setGenders(getGenders);
	}, [movies])

	useEffect(() => {
		if (movies)
			setTmp(filterMovies(movies, filters, sort));
	}, [filters, movies, setTmp, sort])

	function toggleGender(e) {
		if (filters.gender.value.includes(e))
			setFilters({
				...filters, gender: {
					on: filters.gender.on,
					value: filters.gender.value.filter(f => f !== e)
				}
			});
		else
			setFilters({
				...filters, gender: {
					on: filters.gender.on,
					value: [...filters.gender.value, e]
				}
			});
	}
	function toggleFilters(e) {
		let tmp = { ...filters };
		tmp[e.target.name].on = !tmp[e.target.name].on;
		setFilters(tmp);
	}


	return (
		<div className='filters-container'>
			<div className={classes.root}>
				<Grid item xs={12}>
					<Paper id="paper1Cata" className={classes.paper}>
						<FormControlLabel className="labelSort"
							control={
								<Switch
									name='gender' checked={filters.gender.on} onChange={toggleFilters}
									value="checkedB"
									color="primary"
								/>
							}
							label={trans.library.filterAndSort.gender[state.lang]}
						/>
						{filters.gender.on && <ul className='genderslist'>
							{genders.map((e, index) => (
								<li className="genderL" style={{ backgroundColor: filters.gender.value.includes(e) ? '#DFB220' : '' }} key={index} onClick={() => toggleGender(e)}>{e}</li>
							))}
						</ul>}
						<FormControlLabel className="labelSort"
							control={
								<Switch
									name="year"
									checked={filters.year.on}
									onChange={toggleFilters}
									value="checkedB"
									color="primary"
								/>
							}
							label={trans.library.filterAndSort.year[state.lang]}
						/>
						{filters.year.on && <Slider className='filters'
							min={1900}
							max={2019}
							step={1}
							value={syear}
							onChange={(e, newValue) => setSyear(newValue)}
							onChangeCommitted={(e, newValue) => setFilters({ ...filters, year: { on: filters.year.on, value: newValue } })}
							valueLabelDisplay="on"
							aria-labelledby="range-slider"
						/>}
						{/* name='ratings' checked={filters.ratings.on} onChange={toggleFilters} */}
						<FormControlLabel className="labelSort"
							control={
								<Switch
									name='ratings' checked={filters.ratings.on} onChange={toggleFilters}
									value="checkedB"
									color="primary"
								/>
							}
							label={trans.library.filterAndSort.ratings[state.lang]}
						/>
						{filters.ratings.on && <Slider className='filters'
							min={0}
							max={100}
							step={1}
							value={srate}
							onChange={(e, newValue) => setSrate(newValue)}
							onChangeCommitted={(e, newValue) => setFilters({ ...filters, ratings: { on: filters.ratings.on, value: newValue } })}
							valueLabelDisplay="on"
							aria-labelledby="range-slider"
						/>}
					</Paper>
				</Grid>
			</div>
			<div className="orderContainer">
				<ArrowUpwardIcon fontSize="large" className="arrow" aria-label='up-arrow' onClick={() => setSort({ ...sort, order: true })} />
				<ArrowDownwardIcon fontSize="large" className="arrow" aria-label='down-arrow' onClick={() => setSort({ ...sort, order: false })} />

				<FormControl id="orderBy" variant="filled" className={classes.formControl}>
					<InputLabel htmlFor="filled-age-simple">{trans.library.filterAndSort.sortLabel[state.lang]}</InputLabel>
					<Select
						value={sort.value} onChange={(e) => setSort({ ...sort, value: e.target.value })}
						inputProps={{
							name: 'Order by',
							id: 'filled-Orderby-simple',
							className: classes.input
						}}
					>
						{sorts.map((e, index) => (
							<MenuItem className="MenuItem" value={e} key={index}>{menuTard(e, state.lang)}</MenuItem>
						))}
					</Select>
				</FormControl>
			</div>
		</div>
	);
}

function menuTard(e, lang) {
	const sorts = ['name', 'year', 'ratings'];
	if (e === sorts[0])
		return trans.library.filterAndSort.name[lang]
	if (e === sorts[1])
		return trans.library.filterAndSort.year[lang]
	if (e === sorts[2])
		return trans.library.filterAndSort.ratings[lang]
}

function filterMovies(movies, filters, sort) {
	let tmp = [...movies];
	if (filters.gender.on && filters.gender.value.length > 0)
		tmp = tmp.filter(e => filters.gender.value.every(f => e.genre.includes(f)));
	if (filters.year.on && filters.year.value)
		tmp = tmp.filter(e => e.year >= filters.year.value[0] && e.year <= filters.year.value[1])
	if (filters.ratings.on && filters.ratings.value)
		tmp = tmp.filter(e => rateAverage(e.ratings) >= filters.ratings.value[0]
			&& rateAverage(e.ratings) <= filters.ratings.value[1])
	if (sort.value !== '')
		tmp = sortMovies(tmp, sort.value, sort.order)
	return tmp;
}

function sortMovies(movies, type, order) {
	if (type === 'name')
		return movies.sort((a, b) => {
			let i = 0;
			while (a.title.length < i && b.title.length < i &&
				a.title.charCodeAt(i) === b.title.charCodeAt(i))
				i++;
			if (a.title.charCodeAt(i) > b.title.charCodeAt(i)) {
				if (order)
					return 1;
				else
					return -1
			}
			else {
				if (order)
					return -1;
				else
					return 1
			}
		});
	else if (type === 'ratings') {
		return movies.sort((a, b) => {
			if (a.ratings && b.ratings) {
				let aAverage = rateAverage(a.ratings);
				let bAverage = rateAverage(b.ratings);
				if (aAverage > bAverage) {
					if (order)
						return 1;
					else
						return -1
				}
				else {
					if (order)
						return -1;
					else
						return 1
				}

			}
			else if (a.ratings && !b.ratings) {
				if (order)
					return 1;
				else
					return -1;
			}
			else {
				if (order)
					return -1;
				else
					return 1;
			}
		});
	}
	else if (type === 'year') {
		if (order)
			return movies.sort((a, b) => (a.year > b.year ? 1 : -1));
		else
			return movies.sort((a, b) => (a.year > b.year ? -1 : 1));
	}
	else
		return movies;
}

function rateAverage(rate) {
	let average = 0;
	rate.forEach(e => {
		average += stringToNb(e.Value)
	});
	if (rate.length > 0)
	{
		average /= rate.length;
		average = Math.round(average);
	}
	return average;
}

function stringToNb(str) {
	if (typeof (str) !== 'number') {
		let i = str.match(/\.|,/);
		if (i && i[0])
			str = str.split(i[0]).join('');
		str = parseInt(str, 10);
		if (isNaN(str))
			str = 0;
	}
	return str
}
