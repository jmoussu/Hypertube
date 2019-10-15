import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Comment from './components/Comment';
import { Divider, Typography, Button } from '@material-ui/core';
import classes from './Comments.module.css';
import trans from '../../translate';
import { useNotifications } from '../../app/useNotifications';
import { useHttpError } from '../../app/useHttpError';

export default function Comments(props) {
	const { imdb, title, userid, username, state } = props;
	const [comment, setComment] = useState('');
	const [comments, setComments] = useState(null);
	const [error, setError] = useState(false);
	const { notifyError } = useNotifications();
	const { handleHttpResponseError } = useHttpError();

	useEffect(() => {
		const CancelToken = axios.CancelToken;
		const source = CancelToken.source();
		async function fetchComment() {
			try {
				let res = await axios.get(`/movie/comment/display?imdb=${imdb}&title=${title}`, {cancelToken:source.token});
				if (res.data)
					setComments(res.data);
			} catch (err) {
				if (axios.isCancel(err))
					source.cancel();
				else
					setError('unknow');
			}
		}
		if (!comments)
			fetchComment();
		return () => {
			source.cancel();
		}
	}, [comments, imdb, title])

	async function sendComment(e) {
		e.preventDefault();
		if (comment !== '')
		{
			try {
				let res = await axios.post('/movie/comment/add', {
					imdb: imdb,
					id: userid,
					comment: comment
				});
				if (res.data && !res.data.error)
				{
					setComments([{...res.data, username: username},
						...comments]);
					setComment('');
				}
				else
					notifyError(trans.error.format[state.lang]);
			} catch (err) {
				if (err.response) {
					handleHttpResponseError(err.response.status);
				} else {
					notifyError(trans.error.unknow[state.lang]);
				}
			}
		}
	}

	async function delComment(c) {
		try {
				let res = await axios.post('/movie/comment/delete', {
					imdb: imdb,
					id: c.userId,
					commentId: c._id
				});
			if (res.status === 200)
				setComments(comments.filter(f => f._id !== c._id));
		} catch (err) {
			if (err.response) {
				handleHttpResponseError(err.response.status);
			} else {
				notifyError(trans.error.unknow[state.lang]);
			}
		}
	}

	function pressEnter(e) {
		if (e.key === 'Enter' && !e.shiftKey)
		{
			e.preventDefault();
			var evt = new MouseEvent("click");
			evt.initMouseEvent("click", true, true, window,
				0, 0, 0, 0, 0, false, false, false, false, 0, null);
			document.getElementById(`submit-comment`).dispatchEvent(evt);
		}
	}

	return (
		<div className={classes.root}>
			{error}
			<form onSubmit={sendComment}>
				<Typography variant="h4" color="textPrimary">{trans.movie.form.title[state.lang]}</Typography>
				<textarea
					className={classes.commentPost}
					placeholder={trans.movie.form.textarea[state.lang]}
					value={comment}
					onChange={(e) => setComment(e.target.value)}
					onKeyDown={pressEnter}
					rows='5'
					cols='80'
				/>
				<Button id="submit-comment" type="submit" variant="contained" color="primary">{trans.movie.form.submit[state.lang]}</Button>
			</form>
			<Divider variant="fullWidth" style={{ marginTop: 20, marginBottom: 20 }} />
			<div>
				{comments && comments.map((c, idx) => (
					<Comment
						key={idx}
						username={c.username}
						time={displayDate(c.date)}
						message={c.content}
						deletable={c.username === username}
						onDelete={() => delComment(c)}
					/>
				))}
			</div>
		</div>
	);
}

function displayDate(date) {	
	let d = new Date(date);
	return `${d.getHours()}:${d.getMinutes()} - ${d.getDate()}/${d.getMonth()}/${d.getFullYear()}`;
}
