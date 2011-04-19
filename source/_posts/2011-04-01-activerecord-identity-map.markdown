---
title: "ActiveRecord Identity Map"
author: "Josh Kalderimis"
categories:
  - "what-s-new-in-edge-rails"
---

<span class="version">**Rails** 3.1</span>

If you have been using rails for a while now you may be familiar with Active Records query cache. The query cache is a powerful part of Active Record which reduces unnecessary SQL calls and provides general speed improvements, especially when dealing with associations. The problem with the query cache though is when retrieving an identical record from the db, instead of the same object being returned two objects will be created. Eg.

<div class="code_window">
<em>rails console</em>
{% highlight ruby %}
  user1 = User.find(1) # => #<User id: 1, name: "Josh">
  user2 = User.find(1) # => #<User id: 1, name: "Josh">

  user1 == user2 # => true

  user1.object_id == user2.object_id # => false
{% endhighlight %}
</div>

<div class="code_window">
<em>log/development.log</em>
{% highlight sql %}
  User Load (0.2ms)  SELECT "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 1]]
  CACHE (0.0ms)  SELECT "users".* FROM "users" WHERE "users"."id" = ? LIMIT 1  [["id", 1]]
{% endhighlight %}
</div>

Thanks to the fantastic work of [Emilio Tagua](http://twitter.com/miloops) during the Ruby Summer of Code 2010, Active Record in 3.1 will gain an identity map. What's an identity map you ask? An identity map keeps a collection of previously instantiated records and returns the object associated with this record if a request is made for it again.

<div class="code_window">
<em>rails console</em>
{% highlight ruby %}
  user1 = User.find(1) # => #<User id: 1, name: "Josh">
  user2 = User.find(1) # => #<User id: 1, name: "Josh">

  user1 == user2 # => true

  user1.object_id == user2.object_id # => true
{% endhighlight %}
</div>

<div class="code_window">
<em>log/development.log</em>
{% highlight sql %}
  User Load (2.2ms)  SELECT "users".* FROM "users" LIMIT 1
  User with ID = 1 loaded from Identity Map
{% endhighlight %}
</div>

Rails wraps a request with the identity map and flushes it at the end of the request, and don't worry, it's thread safe. You can also use an identity map in the console, background worker, or manually within a request (if it's turned off by default).

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
<em>Ruby - config/applicaton.rb</em>
{% highlight ruby %}
  config.active_record.identity_map = true
{% endhighlight %}
</div>

And while the query cache is all about speed improvements, the identity map is primarily focused on consistency, thus they go hand in hand.


####Links:

Read Emilio's [blog post](http://miloops.com/post/3391477665/identity-map-and-active-record)

Some of the [source code](https://github.com/rails/rails/blob/master/activerecord/lib/active_record/identity_map.rb)

The original [pull request](https://github.com/rails/rails/pull/76)

And the [Identity Map pattern](http://www.martinfowler.com/eaaCatalog/identityMap.html)