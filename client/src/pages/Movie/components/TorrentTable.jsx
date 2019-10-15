import React from 'react';
import {
  makeStyles,
  Table,
  Paper,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
} from '@material-ui/core';
import frenchFlagImg from '../../../assets/images/flag_fr.png';
import englishFlagImg from '../../../assets/images/flag_en.png';
import trans from '../../../translate';

import { RemoveRedEye as ViewIcon } from '@material-ui/icons';

const useStyles = makeStyles(theme => ({
  root: {
    minWidth: '360px',
    maxWidth: '800px',
    marginTop: theme.spacing(3),
    marginLeft: 'auto',
    marginRight: 'auto',
    overflowX: 'auto',
  },
  table: {
    width: '100%',
  },
  langFlag: {
    width: '20px',
  },
}));

export default function TorrentTable({
  torrentList,
  onClickOnView,
  state,
}) {
  const classes = useStyles();
  return (
      <Paper className={classes.root}>
        <Table className={classes.table}>
          <TableHead>
            <TableRow>
              <TableCell>{trans.movie.tTable.quality[state.lang]}</TableCell>
              <TableCell>Seeds</TableCell>
              <TableCell>Peers</TableCell>
              <TableCell>{trans.movie.tTable.language[state.lang]}</TableCell>
              <TableCell>{trans.movie.tTable.link[state.lang]}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            { torrentList.map(torrent => (
              <TableRow key={torrent.hash || torrent.magnet}>
                <TableCell>{torrent.quality}</TableCell>
                <TableCell>{torrent.seeds}</TableCell>
                <TableCell>{torrent.peers}</TableCell>
                <TableCell>
                  <img 
                    className={classes.langFlag}
                    src={getFlagSrcByLang(torrent.lang)}
                    alt={torrent.lang}
                  />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => onClickOnView(torrent)}>
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
  );
}

function getFlagSrcByLang(lang) {
  switch (lang.toLowerCase()) {
    case 'english':
    case 'eng': return englishFlagImg;
    case 'fre':
    case 'french':
    case 'fr': return frenchFlagImg;
    default: return englishFlagImg;
  }
}
