
/**
 * Dependencies.
 */

var Base = require('./base')
  , moment = require('moment')

/**
 * Expose `CSVReporter`.
 */

exports = module.exports = CSVReporter;

/**
 * Make a new `CSVReporter`.
 *
 * @param {Runner} runner
 */

function CSVReporter(runner){
  var self  = this;
	this.rows = [];
	this.title = runner.fullTitle ? runner.fullTitle() : (runner.title || 'tests');

  runner.on('test end', function(test){
		self.rows.push(clean(test));
	});

}

CSVReporter.prototype.download = function(){
	// csv data
	var csvEncoded = this.rows.reduce(function(csv, row){
		return csv + (row || []).join(',') + '\n';
	}, 'data:text/csv;charset=utf-8,');

	// download
	var encodedUri = encodeURI(csvEncoded);
	var link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	var filename = moment().format('YYYYMMDD') + '_' + this.title.split(' ').join('_');
	link.setAttribute("download", filename + '.csv');
	link.click();
}

function clean(test){
	return [
		  test.fullTitle()
		, test.state
		, test.get('runs')
		, coerce(test.err)
	];
}

function coerce(err){
	if(!err) return '';
	return test.err.stack || test.err.toString();
}
