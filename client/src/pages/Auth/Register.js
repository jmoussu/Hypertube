import React, { useState, useEffect, useRef, useContext } from 'react';
import { navigate } from '@reach/router';
import { Store } from '../../store';
import axios from 'axios';
import Notfound from '../404.js'
import trans from '../../translate';
import TextField from "@material-ui/core/TextField";
import Button from '@material-ui/core/Button'
import '../../css/main.css';
import ClassesUi from "../ClassesUi";
import { useNotifications } from '../../app/useNotifications';


function Register(props) {
	const classes = ClassesUi();
	const { state } = props;
	const lastname = useFormInput('');
	const firstname = useFormInput('');
	const username = useFormInput('');
	const mail = useFormInput('');
	const password = useFormInput('');
	const cfpassword = useFormInput('');
	const [mess, setMess] = useState('');
	const [error, setError] = useState(null);
	const [img, setImg] = useState(null);
	const fileInput = useRef(null);
	const { notifyError } = useNotifications(); 


	async function handleSubmit(e) {
		e.preventDefault();
		try {
			if (!error && img) {
				let newForm = new FormData();
				newForm.append('username', username.value)
				newForm.append('lastname', lastname.value)
				newForm.append('firstname', firstname.value)
				newForm.append('mail', mail.value)
				newForm.append('password', password.value)
				newForm.append('cfpassword', cfpassword.value)
				newForm.append('file', img.file);
				let res = await axios.post('/auth/registration', newForm);
				if (res.data.error)
					res.data.error.forEach(e =>
						notifyError(trans.error[e.error][state.lang]))
				else {
					setMess(trans.login.form.registration.mailActivate[state.lang]);
					document.getElementsByClassName('formInfo')[1].style.display = 'none';
				}
			}
			else
            	notifyError(trans.form.emptyFields[state.lang])
		} catch (error) {
			setError(trans.error.unknow[state.lang]);
		}
	}

	//IS CALLED WHEN ADDING A FILE AND CHECK FEW THNGS BEFORE CALLING UPLOAD
	function toggleInput() {
		let fileImg = fileInput.current.files[0];
		if (fileImg) {
			if (fileImg.size > 1000000)
            	notifyError(trans.error.size[state.lang])
			else if (!fileImg.type.match(/image\/?(png)|(jpg)|(jpeg)/))
            	notifyError(trans.error.format[state.lang])
			else {
				setImg({
					file: fileImg,
					preview: URL.createObjectURL(fileImg)
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
	if (state.login) {
		return navigate('/')
	} else {
		return (
			<div className="identify">
				{mess && <p>{mess}</p>}
				<form className="formInfo" onSubmit={handleSubmit}>
					<Lastname val={lastname} state={state} classe={classes} setError={setError} />
					<Firstname val={firstname} state={state} classe={classes} setError={setError} />
					<Username val={username} state={state} classe={classes} setError={setError} />
					<Mail val={mail} state={state} classe={classes} setError={setError} />
					<Password val={password} state={state} classe={classes} setError={setError} />
					<Cfpassword val={cfpassword} pwd={password.value} state={state} classe={classes} setError={setError} />
					<div id='drag' className='user-img' onDrop={dragDrop} onDragOver={dragOver} onDragLeave={dragLeave}>
						<label htmlFor='img' className='textImgDrop'>
						{trans.profil.imgdrop[state.lang]}<br />
						(1mo max, format: jpeg/jpg/png)
					<input type="file" ref={fileInput} onChange={toggleInput} id='img' accept='image/jpeg, image/jpg, image/png' style={{ display: 'none' }} />
						</label>
						{img && img.preview && <img src={img.preview} id='imgprev' alt='preview' />}
					</div>
					<Button type="submit" variant="contained" id="sendRegister" color="primary" className={classes.button}> {trans.login.form.registration.submitButton[state.lang]} </Button>
				</form>
			</div>
		)
	};
}

export function useFormInput(initialValue) {
	const [value, setValue] = useState(initialValue);

	function handleChange(e, str) {
		if (str)
			setValue(str);
		else
			setValue(e.target.value);
	}

	return {
		value,
		onChange: handleChange
	};
}

export function useCheckServForVal(value, name, tmp) {
	const [error, setError] = useState(null);
	useEffect(() => {
		var elem = document.getElementById(name);
		async function check_value(e) {
			if (tmp !== value)
			{
			try {
				const res = await axios.post(`/auth/registration/${name}`,
					{ value: value });
				if (res.data.error)
					setError(res.data.error);
				else if (error)
					setError(null);
			} catch (err) {
				// setError(trans.error.unknow[state.lang]);
				setError('error');
			}
			}
		}
		elem.addEventListener("blur", check_value);
		return () => {
			elem.removeEventListener("blur", check_value);
		};
	})
	return (error);
}

export function Lastname(props) {
	const error = useCheckServForVal(props.val.value, 'lastname');
	if (error)
		props.setError(true);
	else
		props.setError(false);

	return (
		<TextField
			name='lastname'
			type='text'
			{...props.val}
			id="lastname"
			label={trans.form.placeholderName[props.state.lang]}
			className={props.classe.textField}
			margin="normal"
			variant="filled"
			error={!!error}
			helperText={error && trans.error[error][props.state.lang]}
		/>
	);
}

export function Firstname(props) {
	const error = useCheckServForVal(props.val.value, 'firstname');
	if (error)
		props.setError(true);
	else
		props.setError(false);

	return (
		<TextField
			name='firstname'
			type='text'
			{...props.val}
			id="firstname"
			label={trans.form.placeholderFirstname[props.state.lang]}
			className={props.classe.textField}
			margin="normal"
			variant="filled"
			error={!!error}
			helperText={error && trans.error[error][props.state.lang]}
		/>
	);
}

export function Username(props) {
	const error = useCheckServForVal(props.val.value, 'username', props.tmp);
	if (error)
		props.setError(true);
	else
		props.setError(false);

	return (
			<TextField
				name='username'
				type='text'
				{...props.val}
				id="username"
				label={trans.form.placeholderUsername[props.state.lang]}
				className={props.classe.textField}
				margin="normal"
				variant="filled"
				error={!!error}
				helperText={error && trans.error[error][props.state.lang]}
			/>
	);
}

export function Mail(props) {
	const error = useCheckServForVal(props.val.value, 'mail', props.tmp);
	if (error)
		props.setError(true);
	else
		props.setError(false);

	return (
		<TextField
			name='mail'
			type='text'
			{...props.val}
			id="mail"
			label={trans.form.placeholderMail[props.state.lang]}
			className={props.classe.textField}
			margin="normal"
			variant="filled"
			error={!!error}
			helperText={error && trans.error[error][props.state.lang]}
		/>
	);
}

export function Password(props) {
	const error = useCheckServForVal(props.val.value, 'password');
	if (error)
		props.setError(true);
	else
		props.setError(false);

	return (
		<TextField
			name='password'
			type='password'
			{...props.val}
			id="password"
			label={trans.form.placeholderPassword[props.state.lang]}
			className={props.classe.textField}
			margin="normal"
			variant="filled"
			error={!!error}
			helperText={error && trans.error[error][props.state.lang]}
		/>
	);
}

export function Cfpassword(props) {
	let cfpassword = props.val;
	let password = props.pwd;
	const [error, setError] = useState(null);

	useEffect(() => {
		var elem = document.getElementById('cfpassword');
		async function check_cfpassword(e) {
			try {
				const res = await axios.post('/auth/registration/cfpassword',
					{
						cfpassword: cfpassword.value,
						password: password
					});
				if (res.data.error)
				{
					props.setError(true);
					setError(res.data.error);
				}
				else if (error)
				{
					props.setError(false);
					setError(null);
				}
			} catch (err) {
				setError('An error occured.');
			}
		}
		elem.addEventListener("blur", check_cfpassword);
		return () => {
			elem.removeEventListener("blur", check_cfpassword);
		};
	})

	return (
		<TextField
			name='cfpassword'
			type='password'
			{...cfpassword}
			id="cfpassword"
			label={trans.form.placeholderConfirm[props.state.lang]}
			className={props.classe.textField}
			margin="normal"
			variant="filled"
			error={!!error}
			helperText={error && trans.error[error][props.state.lang]}
		/>
	);
}

export function Activate(props) {
	const { state } = useContext(Store);
	let [mess, setMess] = useState(false);
	const [count, setCount] = useState(5);

	useEffect(() => {
		function counter() {
			setCount(count - 1);
		}
		var intervalID = setInterval(counter, 1000);
		return function cleanup() {
			clearInterval(intervalID);
		}
	})

	async function validate() {
		try {
			let result = await axios.get(`/auth/activate/${props.token}`);
			if (!result.data.error)
				setMess(trans.login.form.registration.mailValidate[state.lang]);
			else
				setMess(result.data.error);
		} catch (e) {
			setMess(trans.error.unknow[state.lang]);
		}
	}
	if (!mess)
		validate();
	if (count === 0)
		navigate('/');

	if (!props.token)
		return <Notfound />
	else {
		return (
			<>
				<div>
					{mess && <h2>{mess}</h2>}
					<p>{count}</p>
				</div>
			</>
		);
	}
}
export default Register;
