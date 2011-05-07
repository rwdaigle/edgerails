---
title: "Reversible Migrations"
author: "Rohit Arondekar"
author_url: "http://rohitarondekar.com"
categories:
  - "what-s-new-in-edge-rails"
---

<span class="version">**Rails** 3.1</span>

Migrations have always been considered one of the many killer features in Rails. And in Rails 3.1 Migrations got a new trick up their sleeve that will greatly simplify the process of maintaining both the `up` and `down` logic. If you need a little refresher on what migrations are then I suggest reading the official [Rails guide](http://guides.rubyonrails.org/migrations.html).

Lets start by looking at how a typical migration looks like in Rails 3.0

<div class="code_window">
<em>Ruby - db/migrate/20110505090317_create_posts.rb</em>
{% highlight ruby %}
  class CreatePosts < ActiveRecord::Migration
    def self.up
      create_table :posts do |t|
        t.string :title
        t.text :body
        
        t.timestamps
      end
    end
    
    def self.down
      drop_table :posts
    end
  end
{% endhighlight %}
</div>

This migration creates a `posts` table with two fields &mdash; `title` and `body` of type string and text, respectively. The `timestamps` helper creates `datetime` fields &mdash; `created_at` and `updated_at` for free. To reverse this migration we simply need to drop the `posts` table. The class method `down` does precisely this. When Rails is applying a migration it runs the class method `up`. To reverse the migration (as can be done with `rake db:rollback`) it runs the class method `down`.

Two questions come up when you look at this migration &mdash;

<ul>
  <li>
    Why class methods instead of plain 'old instance methods?
  </li>
  <li>
    For simple cases why not just define the up migration and have Rails take care of reversing the migration?
  </li>
</ul>

The ever awesome [Aaron Patterson](http://tenderlovemaking.com) thought the same thing and and decided to simplify things for you and I.

### Introducing `change`

If you run the following command in Edge Rails, the genarated migration will look something like the example below:

<div class="code_window">
<em>console</em>
{% highlight bash %}
  (~/code/migrahedron)९ rails g model Post title:string body:text
{% endhighlight %}
</div>

<div class="code_window">
<em>Ruby - db/migrate/20110505084530_create_posts.rb</em>
{% highlight ruby %}
  class CreatePosts < ActiveRecord::Migration
    def change
      create_table :posts do |t|
        t.string :title
        t.text :body
  
        t.timestamps
      end
    end
  end
{% endhighlight %}
</div>

By default Rails 3.1 will generate migrations for models using the `change` method that will hold the `up` logic. When a rollback is requested Rails will figure out how to reverse the migration for you merely by examining the 'up' direction directives. Go ahead and apply the migration and then rollback. You should see something like the following:

<div class="code_window">
<em>console</em>
{% highlight bash%}
  (~/code/migrahedron)९ rake db:migrate
  (in /home/rohit/code/migrahedron)
  ==  CreatePosts: migrating ====================================================
  -- create_table(:posts)
     -> 0.0012s
  ==  CreatePosts: migrated (0.0013s) ===========================================
  

  (~/code/migrahedron)९ rake db:rollback
  (in /home/rohit/code/migrahedron)
  ==  CreatePosts: reverting ====================================================
  -- drop_table("posts")
     -> 0.0007s
  ==  CreatePosts: reverted (0.0008s) ===========================================
{% endhighlight %}
</div>

Notice how Rails has figured out that in order to reverse the migration, it needs to drop the newly created table.

### What about commands that can't be reversed?

There are certain commands like `remove_column` that cannot be automatically reversed. This is because the information required to re-create the column is not available in the `remove_column` command. If Rails encounters such commands while reversing a migration, an `ActiveRecord::IrreversibleMigration` exception will be raised.

<div class="code_window">
<em>Ruby - db/migrate/20110505101449_remove_title_from_post.rb</em>
{% highlight ruby %}
  class RemoveTitleFromPost < ActiveRecord::Migration
    def change
      remove_column :posts, :title
    end
  end
{% endhighlight %}
</div>

If you try rolling back the above migration you will get something like:

<div class="code_window">
<em>console</em>
{% highlight bash %}
  (~/code/migrahedron)९ rake db:rollback
  (in /home/rohit/code/migrahedron)
  ==  RemoveTitleFromPost: reverting ============================================
  rake aborted!
  An error has occurred, this and all later migrations canceled:
  
  ActiveRecord::IrreversibleMigration
  
  (See full trace by running task with --trace)
{% endhighlight %}
</div>

If you want to handle such cases manually you can still define the `up` and `down` methods <em>almost</em> like before.

### `up` and `down` instance methods

The only change to the old `up` and `down` methods is that they are now instance methods. Say good bye to those awkward `self.up` and `self.down` method definitions.

<div class="code_window">
<em>Ruby - db/migrate/20110505101557_remove_title_from_post.rb</em>
{% highlight ruby %}
    class RemoveTitleFromPost < ActiveRecord::Migration
      def up
        remove_column :posts, :title
      end

      def down
        add_column :posts, :title, :string
      end
    end
{% endhighlight %}
</div>

<div class="notice">
  <p>
    If you're the difficult type you can still use the old class methods in your migrations. More importantly your existing migrations will not break.
  </p>
</div>

### More magic? :(

If you're wondering how migration reversal is determined, and in the spirit of [Jose Valim](http://github.com/josevalim)'s wish to see all Rails magic deconstructed, I thought I'd give a brief idea as to how Rails is reversing a migration automagically.

The magic, erm I mean heavy lifting, happens in the [ActiveRecord::Migration::CommandRecorder](https://github.com/rails/rails/blob/master/activerecord/lib/active_record/migration/command_recorder.rb) class. Basically if you define a `change` method in your migration and are applying the migration then the commands are executed as normal.

However while reversing the migration, the commands are recorded and a list of inverse commands is generated and run. Inverse commands are simply commands that perform the opposite of the original command. For eg: the inverse of `rename_table(old, new)` is `rename_table(new, old)`. The logic to obtain an inverse of a command is provided in the class itself. For those commands whose inverse cannot be obtained, ActiveRecord::IrreversibleMigration is raised.

That was a very simple overview of what is happening behind the scenes. I encourage you to take a look at the [code](https://github.com/rails/rails/blob/master/activerecord/lib/active_record/migration/command_recorder.rb) for yourself to understand how it works.
