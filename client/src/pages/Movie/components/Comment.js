import React from 'react'
import {
  Typography, IconButton,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { Link } from '@reach/router';
import classes from './Comment.module.css';

const Comment = ({
  username,
  message,
  time,
  deletable,
  onDelete,
}) => (
  <div className={classes.root}>
    { deletable && (
      <div className={classes.closeIcon}>
        <IconButton onClick={onDelete} >
          <Close />
        </IconButton>
      </div>
    )}
    <Typography
      component="p"
      className={classes.timestamp}
      color="textPrimary"
      variant="caption"
    >
      {time}
    </Typography>
    <Typography
      className={classes.username}
      color="textPrimary"
      variant="overline"
    >
      <Link to={`/membres/${username}`}>{username}</Link>
    </Typography>
    <Typography
      className={classes.comment}
      color="textPrimary"
      variant="body1"
    >
      {message}
    </Typography>
  </div>
);

export default Comment;
