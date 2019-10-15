import { useSnackbar } from 'notistack';

export const useNotifications = () => {
  const { enqueueSnackbar } = useSnackbar();
  const options = {
	  autoHideDuration: 3000, 
	  preventDuplicate: true,
	  disableWindowBlurListener: true,
  };
  return {
    notifySuccess: msg => enqueueSnackbar(msg, { variant: 'success', ...options }), 
    notifyError: msg => enqueueSnackbar(msg, { variant: 'error', ...options }), 
  };
}
