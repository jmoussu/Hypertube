import React, { useState, useContext } from 'react';
import Login from './Login';
import Register from './Register';
import '../../css/main.css';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import trans from '../../translate';
import { Store } from '../../store';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <Typography
      component="div"
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      <Box p={3}>{children}</Box>
    </Typography>
  );
}

function Auth() {
  const [value, setValue] = useState(0);
  const { state } = useContext(Store);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  return (
    <>
      <section className="auth">
        <div className="pres">
          <h1>HYPERTUBE</h1>
          <p>{trans.login.slogan[state.lang]}</p>
          <img src="https://www.cinehorizons.net/sites/default/files/affiches/42.jpg" alt="film 42" />
        </div>
        <div>
          <Tabs
            className="tabAuth"
            value={value}
            indicatorColor="primary"
            onChange={handleChange}
            centered={true}
          >
            <Tab label={trans.login.form.connexion.title[state.lang]} />
            <Tab label={trans.login.form.registration.title[state.lang]} />
          </Tabs>
          <TabPanel value={value} index={0}>
            <Login state={state} />
          </TabPanel>
          <TabPanel value={value} index={1}>
            <Register state={state} />
          </TabPanel>
          <div className="signWith">
            <a href="http://localhost:3001/auth/42" className="fortytwo">
              <div className="signLogo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/8/8d/42_Logo.svg" alt="logo42" />
                <p>{trans.login.form.omniauth[state.lang]}42</p>
              </div>
            </a>
            <a href="http://localhost:3001/auth/instagram" className="insta">
              <div className="signLogo">
                <img src="https://www.shareicon.net/download/2017/07/08/888203_photo.svg" alt="logoInstagram" />
                <p>{trans.login.form.omniauth[state.lang]}Instagram</p>
              </div>
            </a>
            <a href="http://localhost:3001/auth/github" className="github">
              <div className="signLogo">
                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Octicons-mark-github.svg/768px-Octicons-mark-github.svg.png" alt="logogithub" />
                <p>{trans.login.form.omniauth[state.lang]}Github</p>
              </div>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

export default Auth;
