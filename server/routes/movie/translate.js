const axios = require('axios');
require('dotenv').config()

async function translate(req, res) {
	try {
		let response = await axios({
			method: 'post',
			url: `https://translate.yandex.net/api/v1.5/tr.json/translate?key=${process.env.TRANSLATE_KEY}&lang=en-fr`,
			data: `text=${req.body.text}`,
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
		});
		if (response.data.text)
			return res.send({text: response.data.text});
		else
			return ({text: req.body.text});
	} catch (err) {
		if (process.env.MODE === 'DEV')
			console.error(err);
		return res.send({text: req.body.text});
	}
}

module.exports.translate = translate;
