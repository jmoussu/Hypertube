import React, { useEffect, useState, useContext } from 'react';
import { Link } from '@reach/router';
import axios from 'axios';
import {
  makeStyles,
  Avatar,
  CircularProgress,
  Typography,
  List,
  ListItem,
  ListSubheader,
  ListItemText,
} from '@material-ui/core';
// import { useHttpError } from '../app/useHttpError';
import { Store } from '../store';
import trans from '../translate';

const useStyles = makeStyles({
  root: {
    margin: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  bigAvatar: {
    width: 180,
    height: 180,
  },
  title: {
    margin: 10,
  },
});

const Profile = ({ username }) => {
  const [profileInfos, setProfileInfos] = useState(null);
  const classes = useStyles();
  // const { handleHttpResponseError } = useHttpError();
  const { state } = useContext(Store);

  useEffect(() => {
    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/user/other/${username}`,
          { cancelToken: source.token });
        setProfileInfos(res.data);
      } catch (err) {
        if (err.response) {
          // handleHttpResponseError(err.response.status);
        } else if (axios.isCancel(err)) {
          source.cancel();
        }
      }
    }
    fetchProfile();
    return () => {
      source.cancel();
    }
  }, [username]);

  const content = profileInfos ? (
    <>
      <Avatar alt="Stock avatar" src={profileInfos.avatar} className={classes.bigAvatar} />
      <Typography variant="h3">{profileInfos.username}</Typography>
      <Typography variant="h6">{`${profileInfos.firstname} ${profileInfos.lastname}`}</Typography>
      <List
        className={classes.root}
        component="nav"
        aria-labelledby="nested-list-subheader"
        subheader={(
          <ListSubheader color="primary" component="div" id="nested-list-subheader">
            {trans.profil.history[state.lang]}
          </ListSubheader>
        )}
      >
        {profileInfos.views.map((movie, idx) => (
          <Link key={idx} to={`/film/${movie.imdb}`}>
            <ListItem button >
              <ListItemText primary={movie.title} />
            </ListItem>
          </Link>
        ))}
      </List>
    </>
  ) : (
      <CircularProgress />
    );

  return (
    <div className={classes.root}>
      {content}
    </div>
  );
}

export default Profile;
