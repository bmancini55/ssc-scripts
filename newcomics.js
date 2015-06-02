var request = require('request')  
  , Q       = require('q')
  , fs      = require('fs')
  , moment  = require('moment')
  ;

var guid = '8f343728085a483ab505432a2ea8c5a9';

function current() {
  var deferred = Q.defer();
  request.get('https://retailerservices.diamondcomics.com/Widgets/NewReleasesComics/' + guid, function(err, response, body) {
    if(err || response && response.statusCode !== 200) {  
      deferred.reject(err || body);
    } else {
      try {
        var document = { write: function() { }, getElementById: function() { return { innerHTML: null }; } }
          , result
          , settings
          , weeks
          ;

        /* jshint es5:false */
        /* jshint evil:true */
        result = eval(body);        
        settings = eval('DmdNTWSettings_' + guid);        
        /* jshint evil:false */    

        weeks = settings.dates.map(function(date, idx) {
          return {
            release: new Date(date),
            guid: guid,
            items: settings.pageItems[idx]
          };
        });
        deferred.resolve(weeks);
      } 
      catch(e) {        
        deferred.reject(e);
      }
    }
  });
  return deferred.promise;
};

function make() {
  current()
    .then(function(weeks) {
      console.log('Fetched data');
      return Q.Promise(function(resolve, reject) {

        var date = moment().day('Wednesday');
        var datefile = date.format('YYYY-MM-DD');
        var dateslug = date.format('MMMM-DD-YYYY').toLowerCase();
        var datetext = date.format('MMMM Do YYYY');
        var datesub  = date.format('dddd MMMM Do');
        var items = weeks[0].items
        
        var article = {
          "priority": 100,
          "published": true,
          "slug": "new-comics-" + dateslug,
          "pageTitle": "New comics " + datetext + " | South Side Comics",
          "pageDesc": "New comic book day for " + datetext + " at South Side Comics Pittsburgh",
          "eventStart": null,
          "eventEnd": null,
          "template": "news/comics.hbs",
          "title": "Available This Week",
          "subtitle": "New Comics on " + datesub,
          "previewImage": "http://cdn.southsidecomicspgh.com/uploads/news/comics-" + datefile + ".jpg",
          "data": {
            "guid": guid,
            "items": items
          }
        };

        console.log('Saving article');

        fs.writeFile('./comics-' + datefile + '.json', JSON.stringify(article, null, 2), function(err) {
          if(err) return reject(err);
          else { 
            resolve();
            console.log('Article saved');
          }
        });
      });
    })
    .catch(function(err) {
      console.log(err);
    });
}

make();