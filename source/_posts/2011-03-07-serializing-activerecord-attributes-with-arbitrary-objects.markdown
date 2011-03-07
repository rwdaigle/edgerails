---
title: "Serializing ActiveRecord attributes with arbitrary objects"
author: "Jeff Kreeftmeijer"
categories:
  - "what-s-new-in-edge-rails"
---

<span class="version">**Rails** 3.1</span>

As you might know already, ActiveRecord lets you store serialized objects by using `serialize` in your model:

<div class="code_window">
<em>Ruby - app/models/user.rb</em>
{% highlight ruby %}
  class User < ActiveRecord::Base
    serialize :interests
  end
{% endhighlight %}
</div>

Using this model you can store user interests by simply throwing in an array:

<div class="code_window">
<em>rails console</em>
{% highlight ruby %}
user = User.create!(:interests => ['dinosaurs', 'lasers'])
user.reload.interests # => ["dinosaurs", "lasers"]
{% endhighlight %}
</div>

Under the hood, this array is automatically converted to YAML. You won't notice this unless you check what's being inserted into your database:

<div class="code_window">
<em>log/development.log</em>
{% highlight sql %}
INSERT INTO "users" ("updated_at", "interests", "created_at") VALUES ('2011-03-05 13:14:05.054192', '--- 
- dinosaurs
- lasers
', '2011-03-05 13:14:05.054192')
{% endhighlight %}
</div>

### Using arbitrary objects

Aaron Patterson recently did some work for Rails 3.1 to allow you to use arbitrary objects to serialize your attributes. This allows users to do Base64 encoding like this, for example:

<div class="code_window">
<em>Ruby - app/models/user.rb</em>
{% highlight ruby %}
class User < ActiveRecord::Base
  class Base64
    def load(text)
      return unless text
      text.unpack('m').first
    end

    def dump(text)
      [text].pack 'm'
    end
  end

  serialize :interests, Base64.new
end
{% endhighlight %}
</div>

Like with the default YAML serialization, ActiveRecord won't bother you with any serialized data, unless you check the executed query:

<div class="code_window">
<em>rails console</em>
{% highlight ruby %}
user = User.create!(:interests => 'yes.')
user.reload.interests # => "yes."
{% endhighlight %}
</div>

<div class="code_window">
<em>log/development.log</em>
{% highlight sql %}
INSERT INTO "users" ("updated_at", "interests", "created_at") VALUES ('2011-03-05 17:12:01.459862', 'eWVz', '2011-03-05 17:12:01.459862')
{% endhighlight %}
</div>

The only thing you need to do is create a class that responds to the `load` and `dump` methods, pass it to the `serialize` call in your model and you're good to go.

