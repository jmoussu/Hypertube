import React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Skeleton } from '@material-ui/lab';

const useStyles = makeStyles(() => ({
  root: {
    width: '300px',
    margin: '12px',
    backgroundColor: 'rgba(190, 190, 190, 0.45)',
	  boxShadow: '5px 3px 4px 0 rgba(255, 255, 255, 0.2), -7px 6px 10px 0 rgba(245, 245, 245, 0.18)',

    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  spacingTop: {
    marginTop: '8px',
  },
}));

const MovieSkeleton = () => {
  const classes = useStyles();
  return (
  <div className={classes.root}>
    <Skeleton variant="rect" width={300} height={400} />
    <Skeleton className={classes.spacingTop} variant="rect" width={200} height={35} />
    <Skeleton className={classes.spacingTop} variant="rect" width={70} height={25} />
    <Skeleton variant="rect" className={classes.spacingTop} width={120} height={25} />
    <Skeleton variant="rect" className={classes.spacingTop} width={180} height={25} />
  </div>
  );
}

export default MovieSkeleton;