# Rack-rewrite to append "/index.html" to URLs without "."
gem 'rack-rewrite', '~> 1.0.0'  

require 'rack/rewrite'

use Rack::Rewrite do
  r301 %r{^([^\.]*[^\/])$}, '$1/' 
  r301 %r{^(.*\/)$}, '$1index.html'
end

run Rack::Directory.new('site')

# use Rack::Static, :urls => ['/stylesheets'], :root => "output"
# use Rack::Static, :urls => ["/"], :root => Dir.pwd + "public"
# use Rack::Static, :urls => [/./], :root => "public"
# use Rack::ETag

# Empty app, should never be reached:
# class Site
#   def call(env)
#     [200, {"Content-Type" => "text/html"}, ["Ouch, broken link! Please report to contact@bracket7.com"] ]
#   end  
# end
# 
# run Site.new

# use Rack::Static, :urls => ["/stylesheets", "/images", "/javascripts"], :root => "public"
# run lambda { |env| [200, { 'Content-Type' => 'text/html', 'Cache-Control' => 'public, max-age=86400' }, File.open('public/index.html', File::RDONLY)] }