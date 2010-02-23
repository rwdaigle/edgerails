(function($) {
  
  // Fetch the tweets
  $.fn.twitterize = function(query, from_user) {
    
    var $me = $(this);
    var tweets = getStoredTweets($me.cookieName());
    
    if(!tweets) {      
      $.getJSON(
        "http://search.twitter.com/search.json?callback=?",
        { rpp: 5, page: 1, lang: 'en', q: query, from: from_user },
        function(data) {
          storeTweets(data, $me.cookieName());
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
  
  var COOKIE_NAME_SUFFIX = '_tweets';
  
  // Call back to process tweets and apply to template
  $.fn.cookieName = function() {
    return $(this).attr('id') + COOKIE_NAME_SUFFIX;
  };
  
  var storeTweets = function(tweets, cookieName) {
    $.cookie(cookieName, serializeTweets(tweets), { expires: 1 })
  };
  
  var getStoredTweets = function(cookieName) {
    cookieData = $.cookie(cookieName);
    return cookieData ? JSON.parse(cookieData) : null;
  };
  
  var serializeTweets = function(tweets) {
    return JSON.stringify(tweets, ['results', 'from_user', 'text', 'id', 'created_at'])
  }
  
}) (jQuery);