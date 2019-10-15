import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Link, navigate } from '@reach/router';
import CatalogueBar from './catalogueBar';
import SortBar from './sortBar';
import { Store } from '../../store';
import Auth from '../Auth/Auth.js';
import MovieSkeleton from './MovieSkeleton';
import trans from "./../../translate";
import { useNotifications } from '../../app/useNotifications';
import { useHttpError } from '../../app/useHttpError';
import '../../css/main.css';
axios.defaults.withCredentials = true

export default function Library() {
	const { state, dispatch } = useContext(Store);
	const [movies, setMovies] = useState([]);
	const [page, setPage] = useState(1);
	const [searchType, setSearchType] = useState('popular');
	const [loader, setLoader] = useState(false);
	const [tmp, setTmp] = useState(null);
	const [filters, setFilters] = useState({
		year: { on: false, value: null },
		ratings: { on: false, value: null },
		gender: { on: false, value: [] }
	});
	const [sort, setSort] = useState({value: '', order: true});
	const { handleHttpResponseError } = useHttpError();
	const { notifyError } = useNotifications();
	const bol = useRef(false);

	useEffect(() => {
		if (tmp) {
			dispatch({
				type: 'CACHE', payload: {
					searchType: searchType,
					filters: filters,
					sort: sort,
					movies: movies
				}
			});
		}
	}, [tmp, dispatch, filters, movies, searchType, sort])

	useEffect(() => {
		if (state.cache && !tmp) {
			if (state.cache.movies) {
				setMovies(state.cache.movies);
				setFilters(state.cache.filters)
				setSearchType(state.cache.searchType);
				setSort(state.cache.sort);
			}
		}
	}, [state.cache, tmp])

		/*ACTIVER EN PROD
	useEffect(() => {
		window.onload = () => {
			displayData('popular', 1);
		}
	})
	*/
	useEffect(() => {
		function scrollTest(e) {
			let h = document.documentElement;
			let b = document.body;
			let st = 'scrollTop';
			let sh = 'scrollHeight';
			let percent = (h[st] || b[st]) / ((h[sh] || b[sh]) - h.clientHeight) * 100;
			if (percent >= 99 && !loader && searchType !== 'search'
				&& state.login && state.complete)
				nextPage();
		}
		window.addEventListener('scroll', scrollTest);
		return () => {
			window.removeEventListener('scroll', scrollTest);
		}
	})

	useEffect(() => {
		return () => {
		if (bol.current)
			bol.current = false;
		}
	}, [bol])


	async function displayData(str, payload) {
		const CancelToken = axios.CancelToken;
		const source = CancelToken.source();
		setLoader(true);
		bol.current = true;
		if (str !== searchType) {
			setSearchType(str);
			setPage(1);
			setMovies([]);
			setFilters({
				year: { on: false, value: null },
				ratings: { on: false, value: null },
				gender: { on: false, value: [] }
			});
			setSort({ value: '', order: true });
		}
		const apiUri = (() => {
			switch (str) {
				case 'popular': return `/library?page=${payload || 1}`;
				case 'lastadded': return `/library/lastadded?page=${payload || 1}`
				case 'random': return '/library/random';
				case 'search': return `/library/search?name=${payload || '42'}`;
				default: return `/library?page=${payload || 1}`;
			}
		})();

		try {
			const res = await axios.get(apiUri,{ cancelToken:source.token });
			if (res.data && bol.current) {
				if (str !== 'search' && str === searchType && movies)
					setMovies(filterScrap([res.data, movies]));
				else
					setMovies(res.data);
				setLoader(false);
				bol.current = false;
			}
		} catch (err) {
			if (axios.isCancel(err))
				source.cancel();
			if (err.response) {
				handleHttpResponseError(err.response.status)
			} else {
				notifyError(trans.error.unknow[state.lang])				
			}
		}
	}

	async function watchDetails(e) {
		try {
			const res = await axios.post(`/movie/add?imdb=${e.imdb}`, e);
			if (res.status === 200)
				navigate(`/film/${e.imdb}`);
		} catch (err) {
			if (err.response)
				handleHttpResponseError(err.response.status)				
			else
				notifyError(trans.error.unknow[state.lang])				
		}
	}

	function nextPage(e) {
		setPage(page + 1);
		displayData(searchType, page + 1);
	}

	if (!state.login)
		return (<Auth />)
	else if (!state.complete)
		return (
			<p>{trans.library.complete[state.lang]}
			<Link className='link' to='/profil' >{trans.library.profil[state.lang]}</Link>
			</p>);
	else
		return (
			<>
			<CatalogueBar displayData={displayData} activeTab={searchType} loader={loader}/>
			<SortBar state={state} movies={movies} tmp={setTmp} filters={filters} setFilters={setFilters} sort={sort} setSort={setSort} />
				<ul className='gallery'>
					{tmp && tmp.map((e, index) =>
						(<li key={index} className='miniature' onClick={() => watchDetails(e)}>
							<img src={e.image} alt={`cover${index}`} />
							<h2 className='movie-title'>{e.title}</h2>
							<span className='year'>({e.year})</span>
							<ul className='ratings'>
								{e.ratings && e.ratings.map((rate, index) => (<li key={index}>
									{rate.Source} : <span className='rate-value'>{rate.Value}</span></li>))}
							</ul>
							{state.views.includes(e.title) && <span role='img' aria-label='down-arrow'>&#128526;</span>}
						</li>))}
					{loader && [...Array(6)].map((_, idx) => (
						<MovieSkeleton key={idx} />
					))}
				</ul>
			</>
		);
}

function filterScrap(data) {
	let imdb = data[1].map(e => e.imdb);
	data[0] = data[0].filter(e => !imdb.includes(e.imdb));
	return (data[1].concat(data[0]));
}
