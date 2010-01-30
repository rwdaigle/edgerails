(function($) {
  
  // Fetch the tweets
  $.fn.twitterize = function(query) {
    
    var $me = $(this);
    var tweets = getStoredTweets();
    
    if(!tweets) {      
      $.getJSON(
        "http://search.twitter.com/search.json?callback=?",
        { rpp: 10, page: 1, lang: 'en', q: query },
        function(data) {
          storeTweets(data);
          $me.applyTweets(data);
        }
      );
    } else {
      $me.applyTweets(tweets);
    }
  };
  
  // Call back to process tweets and apply to template
  $.fn.applyTweets = function(data) {
    var $me = $(this);
    $me.applyTemplate({    
      getTemplateBody: function() { return $($me.attr('template')).html(); },
      getData: function() { return data; }
    });
  };
  
  var COOKIE_NAME = '_tweets';
  
  var storeTweets = function(tweets) {
    $.cookie(COOKIE_NAME, JSON.stringify(tweets), { expires: 1 })
  };
  
  var getStoredTweets = function() {
    cookieData = $.cookie(COOKIE_NAME);
    return cookieData ? JSON.parse(cookieData) : null;
  };
  
}) (jQuery);