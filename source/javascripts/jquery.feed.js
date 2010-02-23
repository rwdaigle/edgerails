(function($) {
  
  // Fetch the feed
  $.fn.feedme = function() {
    
    $(this).each(function(index, el) {
      var $me = $(el);
      var feedData = getStoredFeed($me.cookieName());
    
      if(!feedData) {
        var feed = new google.feeds.Feed($me.attr('feed'));
        feed.setNumEntries(5);
        feed.load(function(result) {
          storeFeed(result, $me.cookieName());
          $me.applyFeed(result);
        });
      } else {
        $me.applyFeed(feedData);
      }      
    });
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
    $.cookie(cookieName, serializeFeed(feed), { expires: 1 })
  };
  
  var serializeFeed = function(feed) {
    return JSON.stringify(feed, ['feed', 'entries', 'title', 'link', 'contentSnippet'])
  }
  
  var getStoredFeed = function(cookieName) {
    cookieData = $.cookie(cookieName);
    return cookieData ? JSON.parse(cookieData) : null;
  };
  
}) (jQuery);