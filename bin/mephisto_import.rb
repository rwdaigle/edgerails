#, :limit => 1, :order => 'published_at DESC'
Article.find(:all, :conditions => ["title like ?", "%What's New in Edge Rails%"]).each do |article|
  author = article.user.login
  permalink = article.permalink
  title = article.title.gsub("What's New in Edge Rails: ", "")
  body = article.body
  { "<macro:code lang=\"ruby\">" => "<notextile>\n{% highlight ruby %}",
    "<macro:code>" => "<notextile>\n{% highlight bash %}",
    "<macro:code lang=\"bash\">" => "<notextile>\n{% highlight bash %}",
    "<macro:code lang=\"xml\">" => "<notextile>\n{% highlight xml %}",
    "<macro:code lang=\"html\">" => "<notextile>\n{% highlight html %}",
    "<macro:code lang=\"erb\">" => "<notextile>\n{% highlight erb %}",
    "</macro:code>" => "{% endhighlight %}\n</notextile>"}.each do |replace, with|
    body = body.gsub(replace, with)
  end
  body = body[0..(body.index('tags: <a href="http://technorati.com') - 1)] if body.index('tags: <a href="http://technorati.com')
  body.strip!
  dirname = '../edgerails/source/_posts'
  fp = File.open("#{dirname}/#{article.published_at.year}-#{article.published_at.month}-#{article.published_at.day}-#{permalink}.textile", 'w+')
  fp.write(%"---
title: \"#{title.gsub('"', '\"')}\"
author: \"Ryan Daigle\"
categories:
  - \"what-s-new-in-edge-rails\"
---
 
#{body}")
  fp.close
end
