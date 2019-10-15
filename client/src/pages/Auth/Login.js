import React, { useState } from 'react';
import axios from 'axios';
import { navigate } from '@reach/router';
import trans from '../../translate';
import TextField from "@material-ui/core/TextField";
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import '../../css/main.css';
import ClassesUi from "../ClassesUi";
import { useNotifications } from '../../app/useNotifications';

function Login(props) {
  const classes = ClassesUi();
  const username = useFormInput('');
  const password = useFormInput('');
  const { state } = props;
  const [fieldErrors, setFieldErrors] = useState({
    username: null,
    password: null,
    passwordForget: null,
  })
  const [forgetPass, setForgetPass] = useState(false);
	const { notifyError } = useNotifications(); 

  async function handleLogin(e) {
    e.preventDefault();
	  if (username.value !== '' && password.value !== '')
		 {
    try {
      let result = await axios.post('/auth/login', {
        username: username.value,
        password: password.value,
      });
      if (result.data.error) {
        if (result.data.error === '!user') {
          setFieldErrors({
            username: trans.login.loginUser[state.lang],
          });
        } else if (result.data.error === '!pass') {
          setFieldErrors({password: trans.login.loginPass[state.lang]});
        } else if (result.data.error === 'token') {
          notifyError(trans.login.loginToken[state.lang]);
        } else {
          notifyError(trans.error.unknow[state.lang]);
        }
      } else
        window.location.reload(true);
    } catch (err) {
          notifyError(trans.error.unknow[state.lang]);
    }
		 }
	  else
      	notifyError(trans.error.empty[state.lang]);
  }

  async function handleForgetPass(e) {
    e.preventDefault();
		try {
			let result = await axios.post('/auth/askForgetPass',{
					username: username.value
				});
        if (result.status === 200){
          if (result.data.info)
            setFieldErrors({passwordForget: trans.login.form.forgot.alreadyMail[state.lang]});
          else
            notifyError(trans.login.form.forgot.mail[state.lang])
        } else
            notifyError(trans.error.unknow[state.lang]);
		} catch(err) {
      notifyError(trans.error.unknow[state.lang]);
    }
    document.getElementsByClassName('formInfo')[0].style.display = 'none';
    document.getElementsByTagName('p')[2].style.display = 'none';
  }
  if (state.login) {
    return navigate('/')
  } else {
    if (forgetPass) {
      return (
        <div className="identify">
          <p>{trans.login.form.forgot.title[state.lang]}</p>
          <form className="formInfo" onSubmit={handleForgetPass}>
          <TextField
            type='text'
            {...username}
            id="LoginForm"
            label={trans.form.placeholderUsername[state.lang]}
            className={classes.textField}
            margin="normal"
            variant="filled"
            error={!!fieldErrors.passwordForget}
            helperText={fieldErrors.passwordForget}
          />
            <Button
              type="submit"
              variant="contained"
              id="sendLogin"
              color="primary"
              className={classes.button}
            >
              {trans.login.form.forgot.send[state.lang]}
            </Button>
          </form>
          <Link id="ForgotPwd" color="primary" onClick={() => setForgetPass(false)} className={classes.link}> &larr; {trans.login.form.forgot.back[state.lang]} </Link>

        </div>
      )
    } else {
      return (
        <div className="identify">
          <form className="formInfo" onSubmit={handleLogin}>
            <TextField
              type='text'
              {...username}
              id="LoginForm"
              label={trans.form.placeholderUsername[state.lang]}
              className={classes.textField}
              margin="normal"
              variant="filled"
              error={!!fieldErrors.username}
              helperText={fieldErrors.username}
            />
            <TextField
              type='password'
              {...password}
              id="PasswordForm"
              label={trans.form.placeholderPassword[state.lang]}
              className={classes.textField}
              margin="normal"
              variant="filled"
              error={!!fieldErrors.password}
              helperText={fieldErrors.password}
            />
            <Button
              type="submit"
              variant="contained"
              id="sendLogin2"
              color="primary"
              className={classes.button}
            >
              {trans.login.form.connexion.submitButton[state.lang]}
            </Button>
            <Link
              id="ForgotPwd"
              color="primary"
              onClick={() => setForgetPass(true)}
              className={classes.link}
            >
              {trans.login.form.connexion.forgotPass[state.lang]}
            </Link>
          </form>
        </div>
      )
    }
  }
}
function useFormInput(init) {
  const [value, setValue] = useState(init);

  function handleChange(e) {
    setValue(e.target.value);
  }
  return {
    value,
    onChange: handleChange
  };
}

export default Login;
