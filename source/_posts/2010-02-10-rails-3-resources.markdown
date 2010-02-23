---
title: "Rails 3 Resources"
author: "Ryan Daigle"
categories:
  - "what-s-new-in-edge-rails"
---
 
<span class="version">**Rails** 3.0</span>

While we get some [momentum back](/articles/announcements/2010/02/08/edgerails.info-is-live/) here at EdgeRails.info I thought it'd be a good time to spotlight all the other great posts out there regarding [new features in Rails 3](http://weblog.rubyonrails.org/2010/2/5/rails-3-0-beta-release).  There are a lot of changes, both internally and externally, so buckle up:

### Overviews

Here are some good overview posts that will wet your appetite for the juicier technical details below...

[Yehuda](http://yehudakatz.com/), da man, has a few good writeups:

* [A Rails 3 retrospective](http://www.engineyard.com/blog/2010/rails-3-beta-is-out-a-retrospective/)
* [His five favorite things about Rails 3](http://www.engineyard.com/blog/2009/my-five-favorite-things-about-rails-3/)

[Jeremy McAnally](http://omgbloglol.com) has done a lot of work writing about Rails 3 (finally, dude, where ya been?) and has these writeups:

* [An overview of the work done to bring Rails 3 to you](http://omgbloglol.com/post/344792822/the-path-to-rails-3-introduction)
* [Greenfielding a new Rails 3 app](http://omgbloglol.com/post/371893012/the-path-to-rails-3-greenfielding-new-apps-with-the).

### ActiveRecord/ActiveModel

ActiveRecord, while no longer the only persistence framework in town thanks to Rails' new ORM agnosticism, has gotten a lot of love.  Not only have validations and other non core-persistence functionality been pulled out into a new [ActiveModel component](http://github.com/rails/rails/tree/master/activemodel) but ActiveRecord itself now has a much more flexible, chainable and flexible API.  You will like this.

A little about ActiveModel:

* [Yehuda gives the lowdown on ActiveModel](http://yehudakatz.com/2010/01/10/activemodel-make-any-ruby-object-feel-like-activerecord/)
* [I talk a little bit more about the new independent validators](http://edgerails.info/articles/what-s-new-in-edge-rails/2009/08/11/what-s-new-in-edge-rails-independent-model-validators/)
* [Validations get sexy](http://thelucid.com/2010/01/08/sexy-validation-in-edge-rails-rails-3/)
* [Some more validation goodness](http://lindsaar.net/2010/1/31/validates_rails_3_awesome_is_true)

And some meat and potatoes on [ActiveRecord](http://github.com/rails/rails/tree/master/activerecord/).

* [Pratik talks about the new query interface](http://m.onkey.org/2010/1/22/active-record-query-interface)
* [Nick Kallen lays some heavy details about the making of the new query interface](http://magicscalingsprinkles.wordpress.com/2010/01/28/why-i-wrote-arel/)

### ActionController

RESTful support has made it's way from the routing layer and is now embedded deep into ActionController now:

* [I run down the new respond_to RESTful response mechanism](http://edgerails.info/articles/what-s-new-in-edge-rails/2009/08/06/what-s-new-in-edge-rails-cleaner-restful-controllers-w-respond_with/)
* [Jose Valim, the author, goes into more detail about the new RESTful controller support](http://blog.plataformatec.com.br/2009/08/embracing-rest-with-mind-body-and-soul/)
* [Jose adds some examples on the rails blog](http://weblog.rubyonrails.org/2009/8/31/three-reasons-love-responder)
* [Yehuda explains the new render options](http://www.engineyard.com/blog/2010/render-options-in-rails-3/)

### Routing

Routing, one of the hairier, and slicker, parts of the Rails stack has a slightly modified API and a very direct way to address rack mini-apps.  Read about it here:

* [Mikel Lindsaar continues his assault on the Rails scene with this great example of how to run a Sinatra app within Rails](http://lindsaar.net/2010/2/7/rails_3_routing_with_rack)
* [Yehuda gives a great overview of the new routing config](http://yehudakatz.com/2009/12/26/the-rails-3-router-rack-it-up/)
* [Rizwan Reza gets down and dirty with some example routing blocks](http://rizwanreza.com/2009/12/20/revamped-routes-in-rails-3)
* [Yehuda talks about support for generic actions](http://yehudakatz.com/2009/12/20/generic-actions-in-rails-3/)

### ActionMailer

Even the black sheep of the family gets some attention now and then:

* [Mikel Lindsaar talks about his refactoring of ActionMailer](http://lindsaar.net/2010/1/26/new-actionmailer-api-in-rails-3)

### Gem Bundler

Rails 3 comes with a whole new way of specifying, loading and managing gem dependencies: the new [gem bundler](http://github.com/carlhuda/bundler) which was developed in parallel with the new version of Rails and replaces what you're used to seeing as a bunch of `config.gem` statements:

* [Mikel (you should now be on a first name basis with him by now) has a very complete rundown of the new bundler features](http://lindsaar.net/2010/2/6/bundle_me_some_rails)
* [Yehuda, one of the bundler project committers, gives a nice narrative of the bundler features](http://yehudakatz.com/2010/02/01/bundler-0-9-heading-toward-1-0/)
* [Yehuda continues with some real world examples](http://yehudakatz.com/2010/02/09/using-bundler-in-real-life/)

### Railties

Like Thanksgiving leftovers, railties are a grab-bag of goodies:

* [Nick Quaranto talks about the new Rails module (no more RAILS_XXX constants)](http://litanyagainstfear.com/blog/2010/02/03/the-rails-module/)
* [Paul Barry talks about creating customized generators](http://paulbarry.com/articles/2010/01/13/customizing-generators-in-rails-3)
* [Amp your generators using Thor](http://caffeinedd.com/guides/331-making-generators-for-rails-3-with-thor)
* [Ben Scofield shows you how to create module app templates](http://benscofield.com/2009/09/application-templates-in-rails-3/)

There's a new kid in town in Rails 3 - instrumentation.  There's not been much written about it yet but here are few nibbles to get you going:

* [Gavin Stark writes about using instrumentation to log SQL calls](http://hasmanyquestions.wordpress.com/2010/01/17/let-your-sql-growl-in-rails-3/)
* [The subscriber class is the main facilitator of instrumentation so give it a look](http://github.com/rails/rails/blob/master/railties/lib/rails/subscriber.rb)

### Plugins

A whole lot of effort was put into making the internal API of Rails much cleaner.  Cleaner to the point that monkey-patching should be a thing of the past.  One of the main benefactors of this are plugins, which have a whole new way of integrating with Rails apps:

* [Yehuda gives you the lowdown on the official rails blog](http://weblog.rubyonrails.org/2010/2/9/plugin-authors-toward-a-better-future)
* [Yehuda gives you the behind the scenes take on plugins](http://www.engineyard.com/blog/2010/rails-and-merb-merge-plugin-api-part-3-of-6/)
* [Nicolas Merouze shows you plugin developers out there how to upgrade your goodies](http://boldr.net/upgrade-plugins-gems-rails-3/)
* [EngineYard has set up a plugins listing site to publicize which are (and are not) Rails 3 compatible](http://www.railsplugins.org/)

### Upgrading

Whew!  If you've gotten to this point you may be wondering how to stitch this all together and make your now crusty Rails 2.3 app a good looking Rails 3 stud?  Thankfully, you're not alone.

Jeremy McAnally has been busting his hump to bring you the latest on upgrading:

* [How to approach the upgrade](http://omgbloglol.com/post/353978923/the-path-to-rails-3-approaching-the-upgrade)
* [A plugin to help you on your way](http://omgbloglol.com/post/364624593/rails-upgrade-is-now-an-official-plugin)

And everybody's [favorite screencaster](http://peepcode.com) [live codes an upgrade](http://blog.peepcode.com/tutorials/2010/live-coding-rails-3-upgrade).

Rails 3 represents a huge amount of work, both in internal and external improvements.  A big congrats to the whole team and to the community for providing such great content about these changes.

Let me know if I missed any great posts that you've found helpful, I know there are at least a few out there...