import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { navigate } from '@reach/router';
import '../css/main.css';
import trans from '../translate';
import TextField from "@material-ui/core/TextField";
import Button from '@material-ui/core/Button'
import ClassesUi from "./ClassesUi";
import { Store } from '../store';
import { useNotifications } from '../app/useNotifications';

function EditPass(props) {
	const classes = ClassesUi();
	const password = useFormInput('');
	const cfpassword = useFormInput('');
	const [err, setErr] = useState(false);
	const { state } = useContext(Store);
	const { notifySuccess, notifyError } = useNotifications();

	async function handleEditPass(e) {
		e.preventDefault();
		if (password === '' && cfpassword === '')
			return notifyError(trans.error.empty[state.lang])
		if (err)
			return;
		try {
			let result = await axios.post('/auth/updatePass', {
				token: props.token,
				password: password.value,
				cfpassword: cfpassword.value
			});
			if (result.data.error)
				result.data.error.forEach(e =>
					notifyError(trans.error[e.error][state.lang]))
			else if (result.data.origin === 'user')
			{
				notifySuccess(trans.profil.pwdModify[state.lang]);
				password.reset();
				cfpassword.reset();
			}
			else
			{
				notifySuccess(trans.profil.pwdModify[state.lang]);
				navigate('/');
			}
		} catch (e) {
			notifyError(trans.error.unknow[state.lang])
		}
	}

	return (
		<>
			<form className="formInfo" onSubmit={handleEditPass}>
				<Password val={{value: password.value, onChange: password.onChange}} state={state} classe={classes} setErr={setErr} />
				<Cfpassword val={{value: cfpassword.value, onChange: cfpassword.onChange}} pwd={password.value} state={state} classe={classes} setErr={setErr} />
				<Button type="submit" variant="contained" id="sendRegister3" color="primary" className={classes.button}> {trans.form.submitModify[state.lang]} </Button>
			</form>
		</>
	)
}

function useFormInput(initialValue) {
	const [value, setValue] = useState(initialValue);

	function handleChange(e) {
		setValue(e.target.value);
	}
	function reset() {
		setValue('');
	}

	return {
		value,
		onChange: handleChange,
		reset: reset
	};
}
export function useCheckServForVal(value, name) {
	const [error, setError] = useState(null);

	useEffect(() => {
		var elem = document.getElementById('password')
		async function check_value(e) {
			try {
				const res = await axios.post(`/auth/registration/${name}`,
					{ value: value });
				if (res.data.error)
					setError(res.data.error);
				else if (error)
					setError(null);
			} catch (err) {
				setError('A error occured.');
			}
		}
		elem.addEventListener("blur", check_value);
		return () => {
			elem.removeEventListener("blur", check_value);
		};
	})
	return (error);
}
export function Password(props) {
	const error = useCheckServForVal(props.val.value, 'password');
	if (error)
		props.setErr(true);

	return (
		<div className="divForm">
			{/* {error && <span className='error'>{error}</span>} */}
			<TextField
				name='password'
				type='password'
				{...props.val}
				id="password"
				label={trans.form.placeholderPassword[props.state.lang]}
				className={props.classe.textField}
				margin="normal" variant="filled"
				error={!!error}
				helperText={error && trans.error[error][props.state.lang]}
			/>
		</div>
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
					setError(res.data.error);
					props.setErr(true);
				}
				else if (error)
				{
					props.setErr(false);
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
		<div className="divForm">
			{/* {error && <span className='error'>{error}</span>} */}
			<TextField
				name='cfpassword'
				type='password'
				{...props.val}
				id="cfpassword"
				label={trans.form.placeholderConfirm[props.state.lang]}
				className={props.classe.textField} margin="normal"
				variant="filled"
				error={!!error}
				helperText={error && trans.error[error][props.state.lang]}
			/>
		</div>
	);
}
export default EditPass;
