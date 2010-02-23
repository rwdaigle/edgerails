---
title: "The Skinny on Scopes (Formerly named_scope)"
author: "Ryan Daigle"
categories:
  - "what-s-new-in-edge-rails"
---

<span class="version">**Rails** 3.0</span>

<span class="notice source">
  The source for the examples contained in this article are located at: [http://github.com/rwdaigle/edgerails-support/tree/master/the-skinny-on-scopes-formerly-named-scope/](http://github.com/rwdaigle/edgerails-support/tree/master/the-skinny-on-scopes-formerly-named-scope/)
</span>

I remember my heart fluttering with a boyish crush the first time I saw [Nick Kallen](http://magicscalingsprinkles.wordpress.com/)'s has_finder functionality [make it into Rails in the form of `named_scope`](/articles/what-s-new-in-edge-rails/2008/03/24/what-s-new-in-edge-rails-has-finder-functionality/). `named_scope` quickly made its way into my toolset as a great way to encapsulate reusable, chainable bits of query logic.  While it had its downsides (namely its lack of first-class chain support for the likes of `:joins` and `:include`) it redefined how I thought about structuring my model logic.  Once you taste the chainable goodness of `named_scope` you never go back.

So here we are with Rails 3 completely refactoring the internals of ActiveRecord - what's up with our beloved `named_scope`?  Well, the simple answer is that it's been renamed to `scope` and you can use it just as you're used to ... but that's taking the easy way out.  Let's see what else we can do with `scope` in Rails 3.

### Basic Usage

Let's assume a standard `Post` model with `published_at` datetime field along with `title` and `body` (to follow along in code, see the [accompanying project in github](http://github.com/rwdaigle/edgerails-support/tree/master/20100221_skinny_on_scopes/)).

In Rails 2.x here's how we'd have to define the self-explanatory `published` and `recent` named scopes:

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
  The reason we need to use a `lambda` here is that it delays the evaluation of the `Time.zone.now` argument to when the scope is actually invoked.  Without the `lambda` the time that would be used in the query logic would be the time that the class was first evaluated, not the scope itself.
</span>

With Rails 3 the bulk of ActiveRecord is now based on the [Relation](http://github.com/rails/rails/blob/master/activerecord/lib/active_record/relation.rb) class.  Think of relation as named_scope on steroids, weaving chainable query logic into the very fabric of ActiveRecord.

You can see how to use the individual `where`, `order` etc... commands of `Relation` on [Pratik's great writeup of the new query interface](http://m.onkey.org/2010/1/22/active-record-query-interface) as well in [this Railscast](http://railscasts.com/episodes/202-active-record-queries-in-rails-3).  Understanding these are important as the new `scope` is built upon them.

Let's see how - here's how the two named scopes from our previous `Post` example will look in Rails 3:

<div class="code_window">
<em>Ruby - post.rb</em>
{% highlight ruby %}
class Post < ActiveRecord::Base

  scope :published, lambda { 
    where("posts.published_at IS NOT NULL AND posts.published_at <= ?", Time.zone.now)
  }  
  scope :recent, order("posts.published_at DESC")
end
{% endhighlight %}
</div>

While the bulk of the logic is the same - the SQL string portions - you start to see how scopes use the new query interface directly to create reusable query logic versus constructing an options hash as was done in Rails 2.  This really is our first glimpse of how much more flexible the new query interface allows our scopes to be.  No longer are they a slightly different construct than your normal query methods.  They are now _built upon_ the very same query methods that you would use were you to execute a query directly.  This consistency is now prevalent all throughout ActiveRecord.

And there's more...

### Scope Reusability

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

I've been in love with the [`scoped` the anonymous named_scope constructor](http://github.com/rails/rails/blob/17f336e2f00f419a41eb7effb817bd7ad3e84f0d/activerecord/lib/active_record/named_scope.rb#L3) in Rails 2.3 for sometime now, using it to create dynamic and chainable scopes on an as-needed basis.  One use-case you see a lot for this type of functionality is for creating a `search` method that you can still append other query manipulations onto.

For instance, to search our posts we can create this method which will return a scope for your caller to further filter (notice the use of `scoped` to start the chain off with an innocuous scope upon which others can be appended):

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

The use of `inject` here somewhat obfuscates the intent of the method if you're not used to looking at such iterations - here's an easier to follow version with the searchable fields more hard coded (which actually doesn't even use an anonymous scope to get bootstrapped):

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
# What's in the db, titles ~= publish date
Post.all.collect(&:title) #=> ["1 week from now", "Now", "1 week ago", "2 weeks ago"]
Post.published.collect(&:title) #=> ["Now", "1 week ago", "2 weeks ago"]

# Search combinations
Post.search('1').collect(&:title) #=> ["1 week from now", "1 week ago"]
Post.search('1').published.collect(&:title) #=> ["1 week ago"]
Post.search('w').published_since(10.days.ago).collect(&:title) #=> ["Now", "1 week ago"]
Post.search('w').order('created_at DESC').limit(2).collect(&:title) #=> ["2 weeks ago", "1 week ago"]
{% endhighlight %}
</div>

You can imagine a scenario where more complex query-string support could be built, all using anonymous scopes.

Feels great, huh?  It also feels a lot like the [`utility_scopes` gem](http://rubygems.org/gems/utility_scopes) I [released awhile ago](http://ryandaigle.com/articles/2008/8/20/named-scope-it-s-not-just-for-conditions-ya-know) which was my attempt to package up the chainable goodness of named_scope for common query operations.  Rest-assured, there's a much smoother implementation under the covers here in Rails 3 than just some hacks on top of `named_scope`

### Cross-Model Scopes

Scopes are great for operating solely on the columns of a singular class's table, but they can also be used to package cross-model queries (i.e. any SQL that would require a `join`).  Let's add in users (who can author and comment on posts) to the mix and write some scopes on `User` that will fetch only users that have authored published posts as well as users that have commented on a post:

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

<span class="notice">
  It's a good practice to always refer to the `table_name.column_name` when building scopes versus just the `column_name` itself (i.e.: `posts.published_at` vs. just `published_at` in the example above).  This allows for unambiguous column references - especially important when building cross-model scopes where columns from more than one table are joined.
  
  To be extra-flexible you can always invoke `table_name` in place of the hard-coded table name, though. to confess, this is a step I rarely take the time to implement myself:
  
  `where("#{table_name}.published_at IS NOT NULL")`
</span>

Since we've got the full arsenal of ActiveRelation operators at our disposal in scopes, we can do some joins and group bys.  And you can still chain these complex queries - something where the old `named_scope` crapped the bed:

<div class="code_window">
<em>Ruby - irb session</em>
{% highlight ruby %}
# Get all users that have a post published
User.published.collect(&:username) #=> ["tim", "dave"]
User.published.to_sql
  #=> SELECT "users".* FROM "users" join posts on posts.author_id = users.id
  #   WHERE (posts.published_at IS NOT NULL AND posts.published_at <= '2010-02-22 21:33:00.892308')
  #   GROUP BY users.id
  
# Get all users that have commented on a post
User.commented.collect(&:username) #=> ["ryan", "john", "tim", "dave"]
User.commented.to_sql
  #=> SELECT "users".* FROM "users" join comments on comments.user_id = users.id
  #   GROUP BY users.id
  
# Combine them to get all authors that have also commented
User.published.commented.collect(&:username) #=> ["tim", "dave"]
User.published.commented.to_sql
  #=> SELECT "users".* FROM "users"
  #   join posts on posts.author_id = users.id
  #   join comments on comments.user_id = users.id
  #   WHERE (posts.published_at IS NOT NULL AND posts.published_at <= '2010-02-22 21:33:00.892308')
  #   GROUP BY users.id
{% endhighlight %}
</div>

<span class="notice">
  As I've done here, use `scope#to_sql` to peek at what SQL the scope will execute.  Very useful for debugging purposes.
</span>

### Scope-based Model CRUD

Since ActiveRelation lets you invoke all the builder/update/destroy methods on a relation that you're used to using directly against your models, that power is also available at the end of a scope/scope-chain.  Let's play around with our post scopes and use them to do more than just query:

<div class="code_window">
<em>Ruby - irb session</em>
{% highlight ruby %}
# Increment the views_count for all published posts
Post.published.collect(&:views_count) #=> [59, 71, 42]
Post.published.update_all("views_count = views_count + 1")
Post.published.collect(&:views_count) #=> [60, 72, 43]

# Nobody cares about unpublished posts
Post.unpublished.size #=> 1
Post.unpublished.destroy_all
Post.unpublished.size #=> 0
{% endhighlight %}
</div>

You can also create a new model from existing scopes - suppose we have a (very contrived) scoped that gets only posts of certain title:

<div class="code_window">
<em>Ruby - post.rb</em>
{% highlight ruby %}
class Post < ActiveRecord::Base
  
  # Ludacris
  scope :titled_luda, where(:title => 'Luda')
end
{% endhighlight %}
</div>

We can use this scope to directly `build`|`new`|`create`|`create!` instances:

<div class="code_window">
<em>Ruby - irb session</em>
{% highlight ruby %}
Post.titled_luda.size #=> 0
Post.titled_luda.build
  #=> #<Post id: nil, title: "Luda", ...>
{% endhighlight %}
</div>

<span class="notice alert">
  In order to use the creation/builder methods on a scope, the scope should directly define attribute equality using a `where` relation and the hash form of the attribute values, as was done above.  Specifying `where("title = 'Luda'")` would not have propagated the attribute values to newly constructed instances.
</span>

Scopes really can be thought of now as named packages of _both_ query and construction logic.  Very powerful.

### Crazy Town

One thing that's always bugged me is how the logic for what makes a `Post` published is split between scopes in both the `Post` class and the `User` class.  To refresh our collective memories:

<div class="code_window">
<em>Ruby - post.rb</em>
{% highlight ruby %}
class Post < ActiveRecord::Base
  
  scope :published, lambda { 
    where("posts.published_at IS NOT NULL AND posts.published_at <= ?", Time.zone.now)
  }
end
{% endhighlight %}
</div>

And:

<div class="code_window">
<em>Ruby - user.rb</em>
{% highlight ruby %}
class User < ActiveRecord::Base
  
  scope :published, lambda {
    joins("join posts on posts.author_id = users.id").
    where("posts.published_at IS NOT NULL AND posts.published_at <= ?", Time.zone.now).
    group("users.id")
  }
end
{% endhighlight %}
</div>

Most good developers will immediately cringe at the duplication of the `where("posts.published_at IS NOT NULL AND posts.published_at <= ?", Time.zone.now)` relation.

Since I am holding the Rails core team true to their word that if a method is public, consider it part of the public API, here's a little method that will let you keep the query logic for a class with that, and only that, class: `where_values`

Let's look at how we can use `scope#where_values` to refer to the query logic of the `Post.published` scope from within our `User.published` scope:

<div class="code_window">
<em>Ruby - user.rb</em>
{% highlight ruby %}
class User < ActiveRecord::Base
  
  scope :published, lambda {
    joins("join posts on posts.author_id = users.id").
    where(Post.published.where_values).   # Stick this in your pipe
    group("users.id")
  }
end
{% endhighlight %}
</div>

If this feels a little brittle to you, it's probably because I suspect the relation/scope class wasn't meant to be inspected so.  However, this is a real-world scenario I've run into many times and I'd love a sanctioned way to share scope logic between classes, should any of the Railsorati poop on this.

Also, you do have more than just `where_values` that can be accessed - here are the others:

* `joins_values`
* `order_clause`
* `includes_values`
* `having_values`
* `eager_load_values`
* `lock_value`
* `select_values`
* `from_value`
* `create_with_value`

### Summary

This post somewhat glosses over the new query interface for ActiveRecord in Rails 3 to get to the meat of using scopes.  However, none of the scoped yumminess could have happened without the slick new underpinnings of ActiveRecord.  So, if you're still a little confused about all this, definitely read some more about ActiveRecord before jumping into scopes.  Once you do have that foundation, however, you will use scopes on a very regular basis.

<span class="notice resources">
  The following resources were instrumental in the research, creation and construction of this article.  They may also provide a different angle should you be left wanting after reading this post:
</span>

  * [Pratik's 'Active Record Query Interface 3.0' article](http://m.onkey.org/2010/1/22/active-record-query-interface)
  * [Railscast 202: Active Record Queries in Rails 3](http://railscasts.com/episodes/202-active-record-queries-in-rails-3)