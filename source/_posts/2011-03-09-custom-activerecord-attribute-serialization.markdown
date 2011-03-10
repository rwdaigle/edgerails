---
title: "Custom ActiveRecord Attribute Serialization"
author: "Jeff Kreeftmeijer"
author_url: "http://jeffkreeftmeijer.com"
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

These serializeable attributes can then be set as any Ruby type such as an array:

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

Aaron Patterson recently did some work for Rails 3.1 which allows you to use arbitrary objects to serialize your attributes, all they need to do is respond to `load` and `dump`. This allows you to specify a custom encoding for your models `serialize` fields. For example, here is what a Base64 encoding might look like:

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

  serialize :bank_account_number, Base64.new
end
{% endhighlight %}
</div>

Just like the default YAML serialization, ActiveRecord won't bother you with any serialized data, unless you check the SQL query:

<div class="code_window">
<em>rails console</em>
{% highlight ruby %}
user = User.create!(:back_account_number => "0000001 00000011 0000001 00000011")
user.reload
user.bank_account_number # => "0000001 00000011 0000001 00000011"
{% endhighlight %}
</div>

<div class="code_window">
<em>log/development.log</em>
{% highlight sql %}
INSERT INTO "users" ("updated_at", "back_account_number", "created_at") VALUES ('2011-03-05 17:12:01.459862', 'MDAwMDAwMSAwMDAwMDAxMSAwMDAwMDAxIDAwMDAwMDEx\n', '2011-03-05 17:12:01.459862')
{% endhighlight %}
</div>

Just remember, YAML serialization is still used by default, but creating your own serialization object is as simple as `load` and `dump`.

####Links:

[Custom serialization in action video](http://www.youtube.com/watch?v=7cco1jxori8)

The Rails commits [here](https://github.com/rails/rails/commit/3cc2b77dc1cb4c1e5cfac68c7828e35a27415e0d) and [here](https://github.com/rails/rails/commit/ebe485fd8ec80a1a9b86516bc6f74bc5bbba3476)

