
import css from './style/style.css';
import scss from './style/style.scss';
console.log('running...');

require.ensure(['./js/async.js'], function(require){
	var func = require('./js/async.js');
	func();
});

require.ensure(['./js/echo.json'], function(require){
	var echo = require('./js/echo.json');
	console.log(echo.name);
});