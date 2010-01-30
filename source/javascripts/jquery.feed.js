(function($) {
  
  // Fetch the feed
  $.fn.feedme = function() {
    
    var $me = $(this);
    var feedData = getStoredFeed();
    
    if(!feedData) {
      var feed = new google.feeds.Feed($me.attr('feed'));
      feed.load(function(result) {
        storeFeed(result);
        $me.applyFeed(result);
      });
    } else {
      $me.applyFeed(feedData);
    }
  };
  
  // Call back to process tweets and apply to template
  $.fn.applyFeed = function(data) {
    var $me = $(this);
    $me.applyTemplate({    
      getTemplateBody: function() { return $($me.attr('template')).html(); },
      getData: function() { return data; }
    });
  };
  
  var COOKIE_NAME = '_comment_feed';
  
  var storeFeed = function(feed) {
    $.cookie(COOKIE_NAME, JSON.stringify(feed), { expires: 1 })
  };
  
  var getStoredFeed = function() {
    cookieData = $.cookie(COOKIE_NAME);
    return cookieData ? JSON.parse(cookieData) : null;
  };
  
}) (jQuery);