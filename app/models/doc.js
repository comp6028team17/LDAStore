var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;


// var safe = {w: "majority", wtimeout: 10000};

var DocsSchema   = new Schema({
	url: String,
    hierarchy: String,
    topics:  [String],
    words: [String],
    html: String,
    wordcounts: {},
    source: String
}, {collection: 'docs', strict:false});

module.exports = mongoose.model('docs', DocsSchema);
