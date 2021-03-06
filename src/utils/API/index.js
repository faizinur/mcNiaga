import axios from 'axios';
import { Encrypt, Decrypt } from '../Encryption/';
import { f7 } from 'framework7-react';
import { log } from '../../utils/';
const API = axios.create({
	baseURL: `https://app56.ecentrix.net/niaga_api_coll2/`,
	// baseURL: `https://bssdev.ecentrix.net/niaga_mobcoll_api/index.php/`,
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
	},
	transformRequest: [(data, headers) => {
		// Do whatever you want to transform the data
		// f7.preloader.show();
		const params = new URLSearchParams();
		params.append('msg', Encrypt(data));
		return params;
	}],
	transformResponse: [data => {
		// Do whatever you want to transform the data
		// f7.preloader.hide();
		let response = JSON.parse(Decrypt(data));
		// log('transformResponse', response.data);
		return response;
	}]
});

const POST = (...params) => {
	switch (typeof params[0]) {
		case "string":
			const [url, data] = params;
			return new Promise((resolve, reject) => {
				f7.preloader.show();
				API.post(url, data,
					{
						timeout: 600000,
						onDownloadProgress: progressEvent => params[2] && params[2](progressEvent.loaded)
					})
					.then(result => {
						// log(result)
						// log('API RESULT ', params[0], params[1]);
						//list error code simpen sini. reject!
						if (result.data == null) {
							f7.preloader.hide();
							f7.dialog.alert('Maaf banget, Ada Kesalahan pada sistem Kami.');
							reject('Maaf banget, Ada Kesalahan pada sistem Kami.')
						}
						if (result.data.status == "error" || result.status != 200) {
							f7.preloader.hide();
							f7.dialog.alert(`${result.data.message} ${'data' in result.data ? result.data.data : ''}`);
							reject(result.data.message);
						} else {
							f7.preloader.hide();
							resolve(result.data);
						}
					}).catch(err => {
						log('API CATCH ', params[0], err);
						f7.preloader.hide();
						f7.dialog.alert(err+" : "+url);
						reject(err+" : "+url)
					});
			
			});
		case "object":
			let reqList = [];
			params.map(item =>
				reqList.push(
					new Promise((resolve, reject) => {
						f7.preloader.show();
						API.post(...item)
							.then(res => {
								if (res.data == "error" || res.status != 200) {
									f7.preloader.hide();
									f7.dialog.alert(res.message);
									reject(res);
								} else {
									f7.preloader.hide();
									resolve(res.data);
								}
							}).catch(err => {
								f7.preloader.hide();
								reject(err)
							});
					})
				));
			return Promise.all(reqList);
		default: return new Promise(resolve => resolve());
	}
}

export {
	POST,
}

//PENGGUNAAN
/*
import { POST } from '../utils/API';
POST([`Login`,data], [`Login`,data]) // kalau mau banyak.
POST(`Login`, {}) // satu satu aja.
	.then(res => log(res))
	.catch(err => log(err));
*/