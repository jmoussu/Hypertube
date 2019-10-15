import React, { useContext, useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Store } from '../store';
import { Username, Lastname, Firstname, Mail } from './Auth/Register';
import EditPass from './EditPass';
import NotFound from './404';
import { Link } from '@reach/router';
import { useHttpError } from '../app/useHttpError';
import trans from '../translate';
import Button from '@material-ui/core/Button'
import ClassesUi from "./ClassesUi";
import { useNotifications } from '../app/useNotifications';
import '../css/main.css';

const CHANGE_AVATAR = 'CHANGE_AVATAR';
const COMPLETE = 'COMPLETE';

export default function Account(props) {
	const classes = ClassesUi();
	const { state, dispatch } = useContext(Store);
	const { lang } = state;
	const [userData, setUserData] = useState({
		username: '', lastname: '',
		firstname: '', mail: '', lang: '', avatar: ''
	});
	const [userTmp, setUserTmp] = useState({
		username: '', mail: ''
	});
	const [error, setError] = useState(null);
	const fileInput = useRef(null);
	const [img, setImg] = useState(null);
	const [change, setChange] = useState(false);
	const { notifySuccess, notifyError } = useNotifications();
	const { handleHttpResponseError } = useHttpError();

	useEffect(() => {
			let h = document.documentElement;
			let st = 'scrollTop';
		if (h[st] !== 0)
			h[st] = 0;
		}, [])

	useEffect(() => {
		const CancelToken = axios.CancelToken;
		const source = CancelToken.source();
		async function findUser() {
			try {
				let res = await axios.get(`/user/me/${state.id}`,
					{ cancelToken: source.token });
				if (res.data && !res.data.error)
				{
					setUserData({ ...res.data, cfpassword: '' });
					setUserTmp({username:res.data.username, mail: res.data.mail});
				}
				else
					setError(trans.error.unknow[state.lang]);
			} catch (e) {
				if (axios.isCancel(e))
					source.cancel();
				setError(trans.error.unknow[state.lang]);
			}
		}
		if (state.id)
			findUser(state.id);
		return () => {
			source.cancel();
		}
	}, [state.id, state.lang])

	useEffect(() => {
		let intervalID;
		if (change)
			intervalID = setTimeout(() => setChange(false), 4000);
		return () => {
			if (intervalID)
				clearTimeout(intervalID);
		}
	}, [change]);

	async function handleSubmit(e, type) {
		e.preventDefault();
		let payload;
		if (type === 'user')
			payload = {
				username: userData.username,
				lastname: userData.lastname,
				firstname: userData.firstname,
				mail: userData.mail
			};
		else if (type === 'img' && img)
		{
			payload = new FormData();
			payload.append('file', img.file);
		}
		else if (type === 'mdp')
			payload = {
				password: userData.password,
				cfpassword: userData.password
			};
		if (payload && !error)
		{
		try {
			let res = await axios.post(`/user/me/${state.id}/${type}`, payload);
			if (res.data && !res.data.error) {
				if (res.data.complete && !state.complete) {
					notifySuccess(trans.profil.update.complete[lang]);
					dispatch({ type: COMPLETE });
				}
				if (res.data.avatar !== state.avatar) {
					notifySuccess(trans.profil.update.avatar[lang]);
					dispatch({ type: CHANGE_AVATAR, payload: res.data.avatar });
				}
				else {
					if (userData.username !== userTmp.username
						|| userData.mail !== userTmp.mail)
						setUserTmp({username: userData.username,
							mail: userData.mail});
					notifySuccess(trans.profil.update.general[lang]);
				}
				setChange(true);
			}
		} catch (err) {
			if (err.response) {
				handleHttpResponseError(err.response.status);
			} else {
				setError(true);
			}
		}
		}
	}

	function toggleInput() {
		let file = fileInput.current.files[0];
		if (file) {
			if (file.size > 1000000)
            	notifyError(trans.error.size[state.lang])
			else if (!file.type.match(/image\/?(png)|(jpg)|(jpeg)/))
            	notifyError(trans.error.format[state.lang])
			else {
				setImg({
					file: file,
					preview: URL.createObjectURL(file)
				});
			}
		}
	}

	//DEAL THE DRAG AND DROP EVENTS
	function dragDrop(e) {
		e.preventDefault();
		let fileImg = e.dataTransfer.files[0];
		if (fileImg)
			setImg({
				file: fileImg,
				preview: URL.createObjectURL(fileImg)
			});
		document.getElementById('drag').style.border = '3px dashed black';
	}
	function dragOver(e) {
		e.preventDefault();
		document.getElementById('drag').style.border = '3px dashed green';
	}
	function dragLeave(e) {
		e.preventDefault();
		document.getElementById('drag').style.border = '3px dashed black';
	}

	function changeUserData(e) {
		if (e.target.name === 'lastname')
			setUserData({ ...userData, lastname: e.target.value });
		if (e.target.name === 'firstname')
			setUserData({ ...userData, firstname: e.target.value });
		if (e.target.name === 'mail')
			setUserData({ ...userData, mail: e.target.value });
		if (e.target.name === 'lang')
			setUserData({ ...userData, lang: e.target.value });
		if (e.target.name === 'username')
			setUserData({ ...userData, username: e.target.value });
		if (e.target.name === 'password')
			setUserData({ ...userData, password: e.target.value });
		if (e.target.name === 'cfpassword')
			setUserData({ ...userData, cfpassword: e.target.value });
	}

	function clearHistory() {
		if (state.views.length > 0)
			dispatch({ type: 'VIEW', payload: [] });
			axios.post('/user/deleteview', {
				id: state.id
			});
	}

	if (!state.login) {
		return (<NotFound />);
	} else {
		return (
			<div className='account'>
					<h1>{state.username}</h1>
					{state.avatar && <img src={state.avatar} alt='profilPic' className="avatarAccount" />}
					<h2> {trans.profil.personnal[state.lang]} </h2>
					<form className="formInfo" onSubmit={(e) => handleSubmit(e, 'user')}>
						<Username val={{ value: userData.username || '', onChange: changeUserData }} state={state} classe={classes} setError={setError} tmp={userTmp.username} />
						<Lastname val={{ value: userData.lastname || '', onChange: changeUserData }} state={state} classe={classes} setError={setError}/>
						<Firstname val={{ value: userData.firstname || '', onChange: changeUserData }} state={state} classe={classes} setError={setError}/>
						<Mail val={{ value: userData.mail || '', onChange: changeUserData }} state={state} classe={classes} setError={setError} tmp={userTmp.mail} />
						<Button type="submit" variant="contained" id="sendRegister" color="primary" className={classes.button}> {trans.form.submitModify[state.lang]} </Button>
					</form>
					<h2>{trans.profil.img[state.lang]}</h2>
					<form className="formInfo" onSubmit={(e) => handleSubmit(e, 'img')}>
						<div id='drag' className='user-img' onDrop={dragDrop} onDragOver={dragOver} onDragLeave={dragLeave}>
							<label htmlFor='img'>
								{trans.profil.imgdrop[state.lang]}<br />
								(1mo max, format: jpeg/jpg/png)
							<input type="file" ref={fileInput} onChange={toggleInput} id='img' accept='image/jpeg, image/jpg, image/png' style={{ display: 'none' }} />
								{error && <p className='error'>{error}</p>}
							</label>
						</div>
						{img && img.preview && <img src={img.preview} id='imgprev' alt='preview' />}
						<Button type="submit" variant="contained" id="sendRegister2" color="primary" className={classes.button}> {trans.login.form.forgot.send[state.lang]} </Button>
					</form>
					<h2>{trans.profil.pwd[state.lang]}</h2>
					<EditPass token={state.id} />
					<h2>{trans.profil.history[state.lang]}</h2>
					<ul>
						{state.views && state.views.map((e, index) => (<li key={index}><Link className='link' to={`/film/${e.imdb}`}>{e.title}</Link></li>))}
							</ul>
					<Button onClick={clearHistory} variant="contained" id="sendclear" color="primary" className={classes.button}> {trans.profil.clear[state.lang]} </Button>
			</div>
		)
	};
}
