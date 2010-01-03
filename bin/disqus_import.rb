# # Copyright 2009 Michael Ivey, released to public domain
# # Disqus guts lifted from http://github.com/squeejee/disqus-sinatra-importer/tree/master
# # I wanted it to run from MySQL and command line, instead of a Sinatra app
#  
# require 'rubygems'
# require 'rest_client'
# require 'json'
# require 'sequel'
#  
# disqus_url = 'http://disqus.com/api'
# user_api_key = 'jFrVruITEpgnMeOlGtRfXrqTfILaaZ9iVLK8lRWiK4yovOn3MJf7x3bV7lCmDHnG'
# forum_shortname = 'edgerails'
# current_blog_base_url = 'http://edgerails.info/articles/what-s-new-in-edge-rails'
# db = 'mephisto'
# db_user = 'root'
#  
# RestClient.log = 'stdout'
# resource = RestClient::Resource.new disqus_url
# forums = JSON.parse(resource['/get_forum_list?user_api_key='+user_api_key].get)
# forum_id = forums["message"].select {|forum| forum["shortname"]==forum_shortname}[0]["id"]
# forum_api_key = JSON.parse(resource['/get_forum_api_key?user_api_key='+user_api_key+'&forum_id='+forum_id].get)["message"]
#  
# db = Sequel.mysql(db, :user => db_user, :host => 'localhost')
# query = "SELECT comments.body, comments.author, comments.author_email, comments.created_at comment_created_at, articles.title, articles.permalink, articles.published_at article_published_at FROM contents AS comments LEFT JOIN contents AS articles ON comments.article_id = articles.id WHERE comments.type = 'Comment' AND comments.approved = 1 AND articles.published_at IS NOT NULL ORDER BY comments.created_at DESC"
#  
# db[query].each do |comment|
#   article_url = "#{current_blog_base_url}/#{comment[:article_published_at].year}/#{comment[:article_published_at].month}/#{comment[:article_published_at].day}/#{comment[:permalink]}"
#   
#   thread = JSON.parse(resource['/get_thread_by_url?forum_api_key='+forum_api_key+'&url='+article_url].get)["message"]
#   
#   # If a Disqus thread is not found with the current url, create a new thread and add the url.
#   if thread.nil?  
#     thread = JSON.parse(resource['/thread_by_identifier'].post(:forum_api_key => forum_api_key, :identifier => comment[:title], :title => comment[:title]))["message"]["thread"]
#     
#     # Update the Disqus thread with the current article url
#     resource['/update_thread'].post(:forum_api_key => forum_api_key, :thread_id => thread["id"], :url => article_url) 
#   end
#   
#   # Import posts here
#   if resource['/create_post'].post(:forum_api_key => forum_api_key, :thread_id => thread["id"], :message => comment[:body], :author_name => comment[:author], :author_email => comment[:author_email], :created_at => comment[:comment_created_at].strftime("%Y-%m-%dT%H:%M"))
#     puts "Success: #{comment[:author]} on #{comment[:title]}"
#   else
#     puts "FAIL: #{comment[:author]} on #{comment[:title]}"
#   end
# end

#vim: ruby
#
# This script will import all your Mephisto comments into Disqus (http:/disqus.com)
# parts of it came from http://www.locomotivation.com/blog/2008/12/01/disqus-sinatra-importer.html
# but instead of a blog-engine independent sinatra app we needed a mephisto-specific script that
# will just do the job :)
 
unless defined?(RAILS_ROOT)
  puts "This is a Rails 'runner' script. Please run './script/runner path/to/disqus_import' inside your Mephisto directory"
  exit
end
 
 
require 'rest_client'
require 'json'
require 'ruby-debug'
require 'pp'
 
############### EDIT THOSE CONSTANTS BEFORE YOUR RUN THIS SCRIPT, THEN REMOVE THE 'exit' line ############
BLOG_URL = "http://edgerails.info/articles/what-s-new-in-edge-rails"
DISQUS_URL = 'http://disqus.com/api'
USER_API_KEY = ''
FORUM_SHORTNAME = 'edgerails'
##########################################################################################################
 
# RestClient.log = 'stdout'
 
 
def find_or_create_thread(resource, article)
  article_url = BLOG_URL + article.full_permalink
  unless thread = JSON.parse(resource['/get_thread_by_url?forum_api_key='+FORUM_API_KEY+'&url='+article_url].get)["message"]
    thread = JSON.parse(resource['/thread_by_identifier/'].post(:forum_api_key => FORUM_API_KEY, :identifier => article.id, :title => article.title))["message"]["thread"]
  end
 
  resource['/update_thread/'].post(:forum_api_key => FORUM_API_KEY, :thread_id => thread["id"], :url => article_url)
 
  thread["id"]
end
 
def import_comment(resource, comment)
  article = comment.article
 
  thread_id = find_or_create_thread(resource, article)
 
 
  ep = resource['/create_post/']
  email = comment.author_email
  # disqus requires SOME email :)
  email = "unknown@example.com" if email.blank?
  args = {
    :forum_api_key => FORUM_API_KEY,
    :thread_id => thread_id,
    :message => comment.body,
    :author_name => comment.author,
    :author_email => email,
    :author_url => comment.author_url,
    :created_at => comment.created_at.strftime("%Y-%m-%dT%H:%M"),
    # DISQUS crashed with error 500 when we passed IPs. no idea why...
    #:ip_address => comment.author_ip
  }
  puts pp(args)
  res = ep.post(args)
  true
rescue => e
  puts e
  puts e.backtrace[0..10]
  false
end
 
def import_all(resource)
  successful_imports = []
  failed_imports = []
 
  Article.find(:all, :conditions => ["title like ?", "%What's New in Edge Rails%"]).each do |article|
    article.comments.each do |comment|
      if import_comment(resource, comment)
        successful_imports << comment
      else
        failed_imports << comment
      end
    end
  end
end
 
resource = RestClient::Resource.new DISQUS_URL
 
forums = JSON.parse(resource['/get_forum_list?user_api_key='+USER_API_KEY].get)
 
if forums["message"].empty?
  puts "No forums found!"
  exit
end
 
forum_id = forums["message"].select {|forum| forum["shortname"]==FORUM_SHORTNAME}[0]["id"]
FORUM_API_KEY = JSON.parse(resource['/get_forum_api_key?user_api_key='+USER_API_KEY+'&forum_id='+forum_id].get)["message"]
 
import_all(resource)