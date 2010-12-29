(function($) {
  
  // Fetch the tweets
  $.fn.enableSearch = function() {
    
    var $me = $(this);
    var $resultsEl = $($me.attr('results'));
    var cseId = $me.attr('cse');
    
    $me.submit(function() {
      var query = $me.find('input.search_field').attr('value');
      $.googleSearch(query, {
        callback: function(searchResponse) {
          $resultsEl.show();
          $resultsEl.applySearchResults(searchResponse);
        },
        urlParams: { cx: cseId }
      });
      return false;
    });
  };
  
  // Call back to process tweets and apply to template
  $.fn.applySearchResults = function(searchResponse) {
    var $me = $(this);
    $me.applyTemplate({    
      getTemplateBody: function() { return $($me.attr('template')).html(); },
      getData: function() { return searchResponse; }
    });
  };
  
}) (jQuery);