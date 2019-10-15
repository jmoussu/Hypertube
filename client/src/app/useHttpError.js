import { useSnackbar } from 'notistack';
import { useContext } from 'react';
import { Store, actionTypes } from '../store';
import { navigate } from '@reach/router';
import ts from '../translate';

export const useHttpError = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { state, dispatch } = useContext(Store);
  const { login, lang } = state;
  const handleHttpResponseError = status => {
    if (status === 401) {
      enqueueSnackbar(ts.error.unAuthorized[lang], { variant: 'error' });
      if (login) {
        dispatch({ type: actionTypes.LOGOUT });
      } else if (status === 404) {
        navigate('/404');
      } else if (status === 418) {
        enqueueSnackbar(ts.error.imTeapot[lang], { variant: 'error' });
      }
    }
  };

  return {
    handleHttpResponseError,
  };
};
