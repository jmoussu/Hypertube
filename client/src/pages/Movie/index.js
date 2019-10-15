import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import Comments from './comments';
import {
	Button,
	Typography,
	CircularProgress,
} from '@material-ui/core';
import { Link, navigate } from '@reach/router';
import { Store } from '../../store';
import NotFound from '../404';
import TorrentTable from './components/TorrentTable';
import trans from '../../translate';
import { useHttpError } from '../../app/useHttpError';

export default function Movie({ imdb }) {
	const { state, dispatch } = useContext(Store);
	const [movie, setMovie] = useState(null);
	const [videoSrc, setVideoSrc] = useState(null);
	const [subtitles, setSubtitles] = useState(null);
	const [synopsis, setSynopsis] = useState('');
	const { handleHttpResponseError } = useHttpError();

	useEffect(() => {
		let int;
		let sub = document.getElementsByClassName('subtitles')[0];
		if (sub)
			int = setTimeout(() => {sub.style.display = 'none'}, 3000)
		return () => {
			if (int)
				clearTimeout(int)
		}
	})

	useEffect(() => {
		const CancelToken = axios.CancelToken;
		const source = CancelToken.source();
		async function fetchMovie() {
			try {
				let res = await axios.get(`/movie/info/${imdb}`,
					{ cancelToken:source.token });
				if (res.data)
					setMovie(res.data.data);
				else
					navigate('/404');
			} catch (err) {
				if (axios.isCancel(err))
					source.cancel();
				navigate('/404');
			}
		}
		if (imdb)
			fetchMovie();
		return () => {
			source.cancel();
		}
	}, [imdb])

	useEffect(() => {
		const CancelToken = axios.CancelToken;
		const source = CancelToken.source();
		async function translateSyn(text) {
			try {
				let res = await axios.post('/movie/translate',
					{text:text}, {cancelToken:source.token});
				if (res.data.text)
					setSynopsis(res.data.text);
				else
					setSynopsis(text);
			} catch (err) {
				if (axios.isCancel(err))
					source.cancel();
				setSynopsis(text);
			}
		}
		if (movie)
		{
			if (state.lang === 'fr')
				translateSyn(movie.synopsis);
			else
				setSynopsis(movie.synopsis);
		}
		return () => {
			source.cancel();
		}
	}, [movie, state.lang])

	async function goStream(hash, quality) {
		hash.includes('magnet') ?
			setVideoSrc(`http://localhost:3001/movie/watch/${hash}`
			+ `&imdb=${imdb}&quality=${quality}`)
			: setVideoSrc(`http://localhost:3001/movie/watch/${hash}?`
			+ `imdb=${imdb}&quality=${quality}`)
		try {
			let res = await axios.get(`/movie/subtitles/?imdb=${imdb}`);
			if (res.data)
				setSubtitles(res.data);
			if (!state.views.find(e => e.title === movie.title))
			{
				axios.post(`/user/addview`, {
					id: state.id,
					title: movie.title,
					imdb: imdb
				});
				dispatch({type: 'VIEW', payload: [...state.views,
					{imdb: imdb, title: movie.title}
				]});
			}
		} catch (err) {
			if (err.response) {
				handleHttpResponseError(err.response.status);
			}
		}
	}

	function backToCatalogue() {
		navigate('/');
	}


	if (!state.login)
		return (<NotFound />);
	else if (!state.complete)
		return (
			<p>Veuillez completer votre
		<Link to='/profil'>profil</Link>
			</p>);
	else
	{
	if (!movie)
		return (<CircularProgress />)
	else
		return (
		<>
			<Button
				style={{ margin: '24px 0 0 16px' }}
				onClick={backToCatalogue}
				variant="contained"
			>
					{trans.movie.backlink[state.lang]}
			</Button>
			<Typography variant="h1">
				{movie.title}
			</Typography>
			<div className="video">
				{videoSrc ?
					<video key={videoSrc} width="640" height="320" controls autoPlay>
						<source src={videoSrc} />
							{subtitles && subtitles.map((e, index) => (<track key={index} kind="subtitles" src={e.path} srcLang={e.lang} />))}
						</video> : <img src={movie.image} alt={`${movie.title}-cover`}/>}
					</div>
						{subtitles && <div className='subtitles'><span  role='img' aria-label='icon'>&#8618;</span> {trans.movie.subtitles[state.lang]}</div>}
							{videoSrc && <div style={{display:'flex'}}><img src={movie.image} alt={`${movie.title}-cover`} style={{width: '100px', margin:'auto'}}/></div>}
							<TorrentTable
								torrentList={movie.torrents}
								onClickOnView={(torrent) => goStream(torrent.hash || torrent.magnet, torrent.quality)}
								state={state}
							/>
							<ul className='movie-details'>
								<li key='synopsis'>{synopsis}</li>
								<li key='year'>{trans.movie.year[state.lang]}: {movie.year}</li>
								<li key='director'>{trans.movie.director[state.lang]}: {movie.director}</li>
								<li key='actors'>{trans.movie.actor[state.lang]}: {movie.actors}</li>
								<li key='genre'>{trans.movie.gender[state.lang]}:<ul>
											/ {movie.genre.map((f, index) => (<span key={index}>{f} / </span>))}
										</ul>
									</li>
									<li>Box office : {movie.boxoffice}</li>
								</ul>
								<Comments imdb={imdb} title={movie.title} userid={state.id} username={state.username} state={state} />
											</>
		);
	}
}
