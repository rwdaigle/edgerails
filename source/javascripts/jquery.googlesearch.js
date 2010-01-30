/* jQuery Google Search */

(function($) {
    /**
     * Simple wrapper around the Google AJAX Search API.
     *
     * This is the simplest usage:
     * 
     *     $.googleSearch('my search', {
     *       callback: function(responseData) {
     *         // your code here
     *       }
     *     })
     *
     *  responseData passed to your callback is more or less the raw
     *  response data you get back from Google. For details on its structure, see:
     *     http://code.google.com/apis/ajaxsearch/documentation/reference.html#_fonje_response
     *
     * callback is the only required option. Others possible ones are:
     *  - version: API version, defaults to 1.0 (the only allowed one)
     *  - type: the type of search to do, defaults to 'web'. Possible values are:
     *    - web
     *    - local
     *    - video
     *    - blogs
     *    - news
     *    - books
     *    - images
     *    - patent
     *    - See http://code.google.com/apis/ajaxsearch/documentation/reference.html#_fonje_urlbase for latest available searches
     *  - urlParams: an object containing extra parameters to pass to the API. 
     *    - For standard parameters across all searches, see:
     *      http://code.google.com/apis/ajaxsearch/documentation/reference.html#_fonje_args
     *    - For search type specific parameters, see: 
     *      http://code.google.com/apis/ajaxsearch/documentation/reference.html#_fonje_web
     */
    $.googleSearch = function(query, options) {
      var settings = $.extend({
          version: "1.0",
          type: "web",
          query: query
        }, options);

      var urlParams = $.extend({
        v: settings.version,
        q: settings.query
      }, settings.urlParams)

      var url = "http://ajax.googleapis.com/ajax/services/search/" + settings.type + "?callback=?&";

      var callback = function(response) {
        settings.callback(response.responseData);
      };
      $.getJSON(url, urlParams, callback);
    };
  })(jQuery);