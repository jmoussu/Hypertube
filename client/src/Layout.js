import React, { useContext } from 'react';
import AppBar from './Navbar';
import axios from 'axios';
import { navigate } from "@reach/router";
import { Store } from './store';

function Layout({ children }) {
  const { state, dispatch } = useContext(Store);

  async function handleChangeLang(langName){
    if (state.id) {
      try {
        let result = await axios.post(`/user/editLang/${state.id}/${langName}`);
        if (result.status === 200) {
          dispatch({type: 'LANG', payload: langName});
        }
      } catch (e) {
      }
    } else {
      dispatch({type: 'LANG', payload: langName});
    }
  }

  async function HandleLogout() {
    try {
      let result = await axios.get('/auth/logout');
      if (result.status === 200) {
        dispatch({type: 'LOGOUT'});
        navigate('/');
      }
    } catch (e) {
    }
  }

  return (
    <div>
      <AppBar auth={state.login} onChangeLang={handleChangeLang} onClickLogout={HandleLogout} lang={state.lang}/>
      <main>
        {children}
      </main>
    </div>
  );
}

export default Layout;