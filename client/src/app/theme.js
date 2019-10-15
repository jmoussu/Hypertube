import { createMuiTheme } from '@material-ui/core';
import yellow from '@material-ui/core/colors/yellow';
import amber from '@material-ui/core/colors/amber';
import red from '@material-ui/core/colors/red';

export function createHypertubeTheme() {
  return createMuiTheme({
    palette: {
      primary: {
        light: yellow[600],
        main: yellow[700],
        dark: yellow[800]
      },
      secondary: {
        light: amber[300],
        main: amber[700],
        dark: amber[800],
      },
      error: red,
    },
  });
}