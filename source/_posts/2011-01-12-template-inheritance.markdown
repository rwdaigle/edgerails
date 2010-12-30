---
title: "Template Inheritance"
author: "Ryan Daigle"
categories:
  - "what-s-new-in-edge-rails"
---

<span class="version">**Rails** 3.1</span>

Now that the internals of Rails 3 are a little more hospitable to changes we now have a [long-standing feature request](https://rails.lighthouseapp.com/projects/8994/tickets/948) finally implemented - [inherited templates](https://github.com/rails/rails/commit/0f32febad7bca595df44). As the name implies, inherited templates make template lookup follow the controller inheritance heirarchy if it can't find a template for the current controller. This is probably best described with a basic code example. Assuming we have the following controller heirarchy (basically PostsController inherits from AssetsController):

<div class="code_window">
<em>Ruby - assets_controller.rb</em>
{% highlight ruby %}
class AssetsController < ApplicationController
  # Assume index, show etc... action definitions
end
{% endhighlight %}
</div>

<div class="code_window">
<em>Ruby - posts_controller.rb</em>
{% highlight ruby %}
class PostsController < AssetsController
  # Assume index, show etc... action definitions
end
{% endhighlight %}
</div>

Assume there are asset templates for `show` and `index` but only an `index` template for posts:

<div class="code_window">
<em>Bash - directory listings</em>
{% highlight bash %}
myapp > ls app/views/assets
index.html.haml		show.html.haml

myapp > ls app/views/posts
index.html.haml
{% endhighlight %}
</div>

In this scenario any request to the `show` action of the `posts_controller` will be rendered using the `views/assets/show` template. `index` requests will be rendered as expected since both controllers have their own index templates.

<span class="notice">
Template inheritance does also apply to partial lookups, though it does NOT apply to layouts.
</span>

While a seemingly small feature this new inherited lookup of templates allows you to reuse whole parts of common view logic without resorting to using an amalgamation of partials to accomplish the same thing.