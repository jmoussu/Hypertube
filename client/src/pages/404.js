import React, { useState, useEffect, useContext } from 'react';
import { navigate } from '@reach/router';
import trans from '../translate';
import { Store } from '../store';

export default function NotFound()
{
	const [count, setCount] = useState(5);
	const { state: {
		lang
	}} = useContext(Store);

	useEffect(() => {
		function tick() {
			setCount(count - 1);
		}
		var intervalID = setInterval(tick, 1000);
		return function cleanup() {
			clearInterval(intervalID);
		}
	})
	if (count === 0)
		navigate('/');
	return (
		<>
		<h1>{trans.notFoundPage.title[lang]}</h1>
		<h2>{`${trans.notFoundPage.body[lang]} (${count})`}</h2>
		</>
	);
}
