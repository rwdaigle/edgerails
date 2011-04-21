---
title: "ActiveRecord Identity Map"
author: "Josh Kalderimis"
author_url: "http://blog.cookiestack.com"
categories:
  - "what-s-new-in-edge-rails"
---

<span class="version">**Rails** 3.1</span>

If you've been using rails for a while now you may be familiar with Active Record's query cache. The query cache is a powerful part of Active Record which reduces unnecessary SQL calls and provides general speed improvements, especially when dealing with associations. The problem with the query cache, however, is when retrieving two identical records from the database two in-memory objects will still be created.

<div class="code_window">
<em>rails console</em>
{% highlight ruby %}
  user1 = User.find(1) # => #<User id: 1, name: "Josh">
  user2 = User.find(1) # => #<User id: 1, name: "Josh">

  user1 == user2 # => true, b/c AR::Base recognizes that
                 # they have the same primary key

  user1.object_id == user2.object_id # => false, b/c these are two
                                     # different in-memory objects
{% endhighlight %}
</div>

<div class="code_window">
<em>log/development.log</em>
{% highlight sql %}
  User Load (0.2ms)  SELECT "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 1]]
  CACHE (0.0ms)  SELECT "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 1]]
{% endhighlight %}
</div>

Thanks to the fantastic work of [Emilio Tagua](http://twitter.com/miloops) during the Ruby Summer of Code 2010, Active Record in 3.1 will gain an identity map. What's an identity map you ask? An identity map keeps a collection of previously instantiated records and returns the object associated with the record if a request is made for it again.

<div class="code_window">
<em>rails console</em>
{% highlight ruby %}
  user1 = User.find(1) # => #<User id: 1, name: "Josh">
  user2 = User.find(1) # => #<User id: 1, name: "Josh">

  user1 == user2 # => true

  user1.object_id == user2.object_id # => true, b/c these really are
                                     # the same in-memory objects
{% endhighlight %}
</div>

<div class="code_window">
<em>log/development.log</em>
{% highlight sql %}
  User Load (2.2ms)  SELECT "users".* FROM "users" LIMIT 1
  User with ID = 1 loaded from Identity Map
{% endhighlight %}
</div>

<div class="notice">
<p>
Why is having the same in-memory object returned important? Because it
ensures that there is only one copy of a model instance floating around
your system at any one time. Without this assurance, modifications made to a model
object in one context won't be reflected if a copy exists in another
context which can produce hard to trace bugs and inconsistencies.
</p>
</div>

The identity map is created on a per-request basis and is flushed at the completion of the request (as can be expected, the implementation is thread-safe). You can also use an identity map in the console, background worker, or manually within a request (if it's turned off by default).

<div class="code_window">
<em>Ruby - app/models/user.rb</em>
{% highlight ruby %}
  ActiveRecord::IdentityMap.use do
    user = User.find(id)
    user.do_that_heavy_thing_you_do!
  end
{% endhighlight %}
</div>

Although Rails 3.1 will come with the identity map built-in and turned on out of the box, you can try it out for yourself by living on the edge and changing the following in application.rb :

<div class="code_window">
<em>Ruby - config/application.rb</em>
{% highlight ruby %}
  config.active_record.identity_map = true
{% endhighlight %}
</div>

And while the query cache is all about speed improvements, the identity map is primarily focused on consistency, thus they go hand in hand.

<div class="notice resources">
  <p>The following resources were instrumental in the research, creation and construction of this article.  They may also provide a different angle should you be left wanting after reading this post:</p>

  <ul>
    <li><a href="http://miloops.com/post/3391477665/identity-map-and-active-record">Emilio Tagua's blog post</a></li>
    <li><a href="https://github.com/rails/rails/blob/master/activerecord/lib/active_record/identity_map.rb">Some of the Identity Map code</a></li>
    <li><a href="https://github.com/rails/rails/pull/76">The original pull request</a></li>
    <li><a href="http://www.martinfowler.com/eaaCatalog/identityMap.html">And the Identity Map pattern</a></li>
  </ul>
</div>
