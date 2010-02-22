---
title: "The Skinny on Scopes (Formerly named_scope)"
author: "Ryan Daigle"
categories:
  - "what-s-new-in-edge-rails"
---

<span class="version">**Rails** 3.0</span>

<span class="source notice">
  The source for the examples contained in this article are located at: [http://github.com/rwdaigle/edgerails-support/tree/master/20100221_skinny_on_scopes/](http://github.com/rwdaigle/edgerails-support/tree/master/20100221_skinny_on_scopes/)
</span>

I remember my heart fluttering with a boyish crush the first time I saw [Nick Kallen](http://magicscalingsprinkles.wordpress.com/)'s has_finder functionality [make it into Rails in the form of `named_scope`](http://ryandaigle.com/articles/2008/3/24/what-s-new-in-edge-rails-has-finder-functionality). `named_scope` quickly made its way into my toolset as a great way to encapsulate reusable, chainable bits of query logic.  While it had its downsides (namely its lack of first-class chain support for the likes of `:joins` and `:include`) it redefined how I thought about structuring my model logic.  Once you taste the chainable goodness of `named_scope` you never go back.

So here we are with Rails 3 completely refactoring the internals of ActiveRecord - what's up with our beloved `named_scope`?  Well, the simple answer is that it's been renamed to `scope` and you can use juse as you're used to, but that's taking the easy way out.  Let's dive in and see what else we can do with `scope` in Rails 3.

### Basic Usage

Let's assume a standard `Post` model with `published_at` datetime field along with `title` and `body` (to follow along in code, see the [accompanying project in github](http://github.com/rwdaigle/edgerails-support/tree/master/20100221_skinny_on_scopes/)).

In Rails 2.x here's how we'd have define the self-explanatory `published` and `recent` named scopes:

<div class="code_window">
<em>Ruby - post.rb</em>
{% highlight ruby %}
class Post < ActiveRecord::Base

  named_scope :published, lambda { 
    { :conditions =>
      ["posts.published_at IS NOT NULL AND posts.published_at <= ?", Time.zone.now]
    }
  }  
  scope :recent, :order => "posts.published_at DESC"
end
{% endhighlight %}
</div>

<span class="notice">
  The reason we need to use a `lambda` here is that it delays evaluation of the `Time.zone.now` argument to when the scope is actually invoked.  Without the `lambda` the time that would be used in the query logic would be the time that the class was first evaluated, not the scope itself.
</span>

With Rails 3 the bulk of ActiveRecord is now based on the [Relation](http://github.com/rails/rails/blob/master/activerecord/lib/active_record/relation.rb) class.  Think of relation as named_scope on steroids, weaving chainable query logic into the very fabric of ActiveRecord.

You can see how to use the individual `where`, `order` etc... commands of `Relation` on [Pratik's great writeup of the new query interface](http://m.onkey.org/2010/1/22/active-record-query-interface) as well in [this Railscast](http://railscasts.com/episodes/202-active-record-queries-in-rails-3).  Understanding these are important as the new `scope` is built upon them.  Let's see how - here's how the two named scopes from our previous `Post` example will look in Rails 3:

<div class="code_window">
<em>Ruby - post.rb</em>
{% highlight ruby %}
class Post < ActiveRecord::Base

  scope :published, lambda { 
    where(["posts.published_at IS NOT NULL AND posts.published_at <= ?", Time.zone.now])
  }  
  scope :recent, order("posts.published_at DESC")
end
{% endhighlight %}
</div>

While the bulk of the logic is the same - the SQL string portions - you can see how scopes can use the new query interface directly to create reusable query logic versus constructing an options hash as was done in Rails 2.  This really is our first glimpse of how much more flexible the new query interface allows our scopes to be.  No longer are they a slightly different construct than your normal query methods, they are _built upon_ the same query methods that you would use were you to execute a query directly.

And there's more...

#### Scope Reusability

Suppose we want to update our `recent` scope to only include published posts.  We've already defined what `published` means and shouldn't have to redefine it to create a new scope.  Well, you can also chain scopes within scope definitions themselves as we'll do here with the new `recent` and `published_since` scopes.

<div class="code_window">
<em>Ruby - post.rb</em>
{% highlight ruby %}
class Post < ActiveRecord::Base
  
  scope :published, lambda { 
    where("posts.published_at IS NOT NULL AND posts.published_at <= ?", Time.zone.now)
  }
  scope :published_since, lambda { |ago|
    published.where("posts.published_at >= ?", ago)
  }
  
  scope :recent, published.order("posts.published_at DESC")
end
{% endhighlight %}
</div>

Ok, now we're getting warmed up.

### Dynamic Scope Construction

I've been in love with the [anonymous `scoped` named_scope](http://github.com/rails/rails/blob/17f336e2f00f419a41eb7effb817bd7ad3e84f0d/activerecord/lib/active_record/named_scope.rb#L3) in Rails 2.3 for sometime now, using it to create dynamic and chainable scopes on an as-needed basis.  One use-case you see a lot for this type of functionality is for creating a `search` method that you can still append other query manipulations onto.  For instance, to search our posts we can create this method which will return a scope for your caller to further filter:

<div class="code_window">
<em>Ruby - post.rb</em>
{% highlight ruby %}
class Post < ActiveRecord::Base
  
  class << self
    
    # Search the title and body fields for the given string.
    # Start with an empty scope and build on it for each attr.
    # (Allows for easy extraction of searchable fields definition
    # in the future)
    def search(q)
      [:title, :body].inject(scoped) do |combined_scope, attr|
        combined_scope.where(["posts.#{attr} LIKE ?", "%#{sanitize_sql(q)}%"])
      end
    end
  end
end
{% endhighlight %}
</div>

The use of `inject` here somewhat obfuscates the intent of the method if you're not used to looking at such iterations - here's an easier to follow version with the searchable fields more hard coded:

<div class="code_window">
<em>Ruby - post.rb</em>
{% highlight ruby %}
class Post < ActiveRecord::Base
  
  class << self
    
    # The less-slick but, perhaps, more obvious version
    def search(q)
      query = "%#{sanitize_sql(q)}%"
      where("posts.title LIKE ?", query).where("posts.body LIKE ?", query)
    end
  end
end
{% endhighlight %}
</div>

Since we're building upon the chainable goodness of then new query interface (think of scopes now as named bundles of the new ActiveRelation construct), we can do the following with the `search` method:


<div class="code_window">
<em>Ruby - irb session</em>
{% highlight ruby %}

# What's in the db, titles = publish date
Post.all.collect(&:title) #=> ["1 week from now", "Now", "1 week ago", "2 weeks ago"]
Post.published.collect(&:title) #=> ["Now", "1 week ago", "2 weeks ago"]

# Search combinations
Post.search('1').collect(&:title) #=> ["1 week from now", "1 week ago"]
Post.search('1').published.collect(&:title) #=> ["1 week ago"]
Post.search('w').published_since(10.days.ago).collect(&:title) #=> ["Now", "1 week ago"]
Post.search('w').order('created_at DESC').limit(2).collect(&:title) #=> ["2 weeks ago", "1 week ago"]
{% endhighlight %}
</div>

Feels great, huh?  It also feels a lot like the [`utility_scopes` gem](http://rubygems.org/gems/utility_scopes) I [released awhile ago](http://ryandaigle.com/articles/2008/8/20/named-scope-it-s-not-just-for-conditions-ya-know) which was my attempt to package up the chainable goodness of named_scope for common query operations.  Rest-assured, there's a much smoother implementation under the covers here in Rails 3 than just some hacks on top of `named_scope`

### Cross-Model Scopes

Scopes are great for operating on the columns of the class's table, but can also be used to package cross-model queries (i.e. any SQL that would require a `join`).  Let's add in users (who can author and comment on posts) to the mix and write some scopes on `User` that will fetch only users that have authored published posts as well as users that have commented on a post:

<div class="code_window">
<em>Ruby - user.rb</em>
{% highlight ruby %}
class User < ActiveRecord::Base

  has_many :posts, :foreign_key => :author_id
  has_many :comments
  
  # Get all users that have published a post
  scope :published, lambda {
    joins("join posts on posts.author_id = users.id").
    where("posts.published_at IS NOT NULL AND posts.published_at <= ?", Time.zone.now).
    group("users.id")
  }
  
  # Get all users that have commented on a post
  scope :commented, joins("join comments on comments.user_id = users.id").group("users.id")
end
{% endhighlight %}
</div>

Since we've got the full arsenal of ActiveRelation operators at our disposal in scopes, we can do some joins and group bys.  And you can still chain these complex queries - something where the old `named_scope` shit the bed on:

<div class="code_window">
<em>Ruby - irb session</em>
{% highlight ruby %}

# Get all users that have a post published
User.published.collect(&:username) #=> ["tim", "dave"]
User.published.to_sql
  #=> SELECT "users".* FROM "users" join posts on posts.author_id = users.id
  #   WHERE (posts.published_at IS NOT NULL AND posts.published_at <= '2010-02-22 21:33:00.892308')
  #   GROUP BY users.id"
  
# Get all users that have commented on a post
User.commented.collect(&:username) #=> ["ryan", "john", "tim", "dave"]
User.commented.to_sql
  #=> SELECT "users".* FROM "users" join comments on comments.user_id = users.id
  #   GROUP BY users.id"
  
# Combine them to get all authors that have also commented
User.published.commented.collect(&:username) #=> ["tim", "dave"]
User.published.commented.to_sql
  #=> SELECT "users".* FROM "users"
  #   join posts on posts.author_id = users.id
  #   join comments on comments.user_id = users.id
  #   WHERE (posts.published_at IS NOT NULL AND posts.published_at <= '2010-02-22 21:33:00.892308')
  #   GROUP BY users.id"
{% endhighlight %}
</div>


### Crazy Town

### Good Habits


TODOS:
* Show create/new/build on scope
* Show using class method to build named scope
* Reference utility scopes
* reference railscasts/Pratik's article
* Note about using table name in conditions for less conflicts
* Show search class method that returns scope