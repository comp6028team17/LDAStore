module.exports = function(app){

    var express    = require('express');
    var mongoose   = require('mongoose');
    var Doc     = require('./models/doc');
    var bodyParser = require('body-parser');

    mongoose.connect('mongodb://127.0.0.1:27017/topix'); // connect to our database

    // create our router
    var router = express.Router();

    // middleware to use for all requests
    router.use(function(req, res, next) {
        // do logging
        console.log('New request.');
        next();
    });

    router.get('/', function(req, res) {
        res.json({ message: 'API endpoints : [/doc, /docs]' });	
    });

    var saveDocs = function(res, ind, arr){
        arr[ind].save(function(err){
            if(err){
                res.send(err);
                console.log('ERROR', err);
            }

            if((ind+1) == arr.length){
                res.send(String(arr.length).concat(' docuemnts inserted!'));
            }else{
                saveDocs(res, ind+1, arr);
            }
        });
    };

    //Search for docs or insert multiple /docs
    router.route('/docs')

    //create a doc
        .post(function(req, res) {
            if(typeof req.body['docs'] == typeof []){
                var docs = req.body['docs'];
                var mdocs = [];
                console.log("Number of docs: ", docs.length);
                for(var i=0; i < docs.length; i++){

                    var mdoc = new Doc();		// create a new instance of the Bear model
                    var doc = docs[i];
                    for(var prop in doc){
                        if(doc.hasOwnProperty(prop)){
                            mdoc[prop] = doc[prop];
                        }
                    }

                    mdocs.push(mdoc);
                }
                saveDocs(res, 0, mdocs);
            }else if(typeof req.body == typeof {}){

                var doc = new Doc();		// create a new instance of the Bear model
                doc.url = req.body.url;  // set the bears name (comes from the request)
                doc.hierarchy = req.body.hierarchy;
                doc.topics = req.body.topics;
                doc.wordcounts = req.body.wordcounts;
                doc.words = req.body.words;
                doc.html = req.body.html;
                doc.source = req.body.source;

                // for(var prop in doc){
                //     if(doc.hasOwnProperty(prop)){
                //         mdoc[prop] = doc[prop];
                //     }
                // }

                doc.save(function(err) {
                    if (err)
                        res.send(err);
                    res.json({ message: 'Single Doc created!' });
                });
            }
        })



        // get the docs that match topics or all on none existant
        .get(function(req, res) {

            // var projection = {_id:0, url:0, html:0, hiearchy:0, words:0, wordcounts:1, topics:1 };
            var projection = { wordcounts:1 };

            //parse projection obj
            if( typeof req.query.projection == typeof "" ){
                // projection = req.query.projection.split(';');
                keys = req.query.projection.split(';');
                projection = {};
                for(var i in keys){
                    projection[keys[i]] = 1;
                }
            }


            if(
                typeof req.query.intopics == typeof "" ||
                typeof req.query.alltopics == typeof "" ||
                typeof req.query.hierarchy == typeof ""
            ){

                var query = { $and : [] };

                if(typeof req.query.intopics == typeof ""){
                    //split topics from `;` string in topics
                    var topics = req.query.intopics.split(';');
                    console.log('In topics: ', topics);
                    query.$and.push( { topics : {$in: topics} } );
                }
                if(typeof req.query.alltopics == typeof ""){
                    //split topics from `;` string in topics
                    var topics = req.query.alltopics.split(';');
                    console.log('All of topics: ', topics);
                    query.$and.push( { topics : {$all: topics} } );
                }
                if(typeof req.query.hierarchy == typeof ""){
                    //create regex to match hierarchy
                    // var reg = '^'.concat(req.query.hierarchy).concat('*');
                    // console.log('Regex for hierarchy: ', req.query.hierarchy);
                    // console.log(reg);
                    var reg = req.query.hierarchy;
                    console.log('Regex for hierarchy: ', req.query.hierarchy);
                    query.$and.push( { hierarchy : {$regex: reg} } );
                }
                if(typeof req.query.url == typeof ""){
                    //create regex to match hierarchy
                    var reg = req.query.url;
                    console.log('Regex for url: ', req.query.hierarchy);
                    query.$and.push( { url : {$regex: reg} } );
                }

                Doc.find(query, projection, function(err, docs) {
                    if (err)
                        res.send(err);
                    res.json(docs);
                });
            }else{
                Doc.find({}, projection, function(err, docs) {
                    if (err)
                        res.send(err);
                    res.json(docs);
                });
            }
        });

    router.route('/docs/:id')

        .delete(function(req, res){
            Doc.remove({
                _id: req.params.id
            }, function(err, doc){
                if (err)
                    res.send(err);
                res.json("Deleted successfully");
            });
        })

        .get(function(req, res){
            Doc.find({
                _id: req.params.id
            }, function(err, doc){
                if (err)
                    res.send(err);
                res.json(doc);
            });
        })
        .put(function(req, res){
            Doc.findById(req.params.id, function(err, doc){
                if (err)
                    res.send(err);
                
                doc.url = req.body.url;
                doc.words = req.body.words;
                doc.wordcount = req.body.wordcount;
                doc.html = req.body.html;
                doc.topics = req.body.topics;
                doc.hierarchy = req.body.hierarchy;
                doc.source = req.body.source;

                doc.save(function(err){
                    res.send(err);
                });

                res.json({message: "Successfully updated doc"});
            });
        });

        return router;
}
