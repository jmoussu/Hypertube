
import { fade, makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	search: {
		position: 'relative',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.25),
		},
		marginRight: theme.spacing(2),
		marginLeft: 0,
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			marginLeft: theme.spacing(3),
			width: 'auto',
		},
	},
	searchIcon: {
		width: theme.spacing(7),
		height: '100%',
		position: 'absolute',
		pointerEvents: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	inputRoot: {
		color: 'inherit',
	},
	inputInput: {
		padding: theme.spacing(1, 1, 1, 7),
		transition: theme.transitions.create('width'),
		width: '100%',
		// [theme.breakpoints.up('md')]: {
		// 	width: 'auto',
		// },
	},
	container: {
		display: "flex",
		flexWrap: "wrap",
	},
	textField: {
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		backgroundColor: "rgba(190, 190, 190, 0.45)",
		borderTopLeftRadius: "0.3rem",
		borderTopRightRadius: "0.3rem",
	},
	dense: {
		marginTop: theme.spacing(2),

	},
	menu: {
		width: 200,
	},
	button: {
		margin: theme.spacing(1),
	},
	root: {
		flexGrow: 1,
		display: 'flex',
		flexWrap: 'wrap',
	},
	paper: {
		width: '90%',
		margin: 'auto',
		boxSizing: 'border-box',
		padding: '20px',
	},
	control: {
		padding: theme.spacing(2),
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
		color: "white",
		textColor: "white",
	},
	selectEmpty: {
		marginTop: theme.spacing(2),
	},
	input: {
		color: "white"
	  }
}));

export default useStyles;
