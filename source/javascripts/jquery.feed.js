(function($) {
  
  // Fetch the feed
  $.fn.feedme = function() {
    
    var $me = $(this);
    var feedData = getStoredFeed($me.cookieName());
    
    if(!feedData) {
      var feed = new google.feeds.Feed($me.attr('feed'));
      feed.setNumEntries(3);
      feed.load(function(result) {
        storeFeed(result, $me.cookieName());
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
  
  var COOKIE_NAME_SUFFIX = '_feed';
  
  // Call back to process tweets and apply to template
  $.fn.cookieName = function() {
    return $(this).attr('id') + COOKIE_NAME_SUFFIX
  };
  
  var storeFeed = function(feed, cookieName) {
    $.cookie(cookieName, JSON.stringify(feed), { expires: 1 })
  };
  
  var getStoredFeed = function(cookieName) {
    cookieData = $.cookie(cookieName);
    return cookieData ? JSON.parse(cookieData) : null;
  };
  
}) (jQuery);