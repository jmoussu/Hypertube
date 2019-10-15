import React, { useEffect } from 'react'
import axios from 'axios';
export const Store = React.createContext();

export const actionTypes = {
	INIT: 'INIT',
	LOGOUT: 'LOGOUT',
	PROFIL: 'PROFIL',
	CHANGE_AVATAR: 'CHANGE_AVATAR',
	COMPLETE: 'COMPLETE',
	VIEW: 'VIEW',
	LANG: 'LANG',
	CACHE: 'CACHE',
};

const initialState = {
	login: false,
	id: null,
	complete: false,
	username: null,
	avatar: null,
	lang: 'eng',
	views: [],
	cache: {
		searchType : null,
		filters: null,
		sort: null,
		movies: null
	}
};

function reducer(state, action)
{
	switch (action.type)
	{
		case 'INIT':
			return (action.payload)
		case 'LOGOUT':
			return (initialState);
		case 'PROFIL':
			return ({...state});
		case 'CHANGE_AVATAR':
			return ({...state, avatar: action.payload});
		case 'COMPLETE':
			return ({...state, complete: true});
		case 'VIEW':
			return ({...state, views: action.payload});
		case 'LANG':
			return ({...state, lang: action.payload});
		case 'CACHE':
			return ({...state, cache: action.payload});
		default:
			return (state);
	}
}

export function StoreProvider(props)
{
	const [state, dispatch] = React.useReducer(reducer, initialState);
	const value = { state, dispatch };
	useEffect(() => {
		const CancelToken = axios.CancelToken;
		const source = CancelToken.source();
		(async function() {
			try {
				let user = await axios.get('/auth');
				if (user.data !== 'OK')
					dispatch({type: 'INIT', payload:
						{...user.data, login: true}});
			} catch (err) {
				if (axios.isCancel(err))
					source.cancel();
			}
		})();
		return () => {
			source.cancel();
		}
	}, [])
	return (<Store.Provider value={value}>
			{props.children}
	</Store.Provider>
	);
}
