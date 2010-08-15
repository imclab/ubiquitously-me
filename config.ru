require 'logger'
require 'app'

## There is no need to set directories here anymore;
## Just run the application
require 'resque/server'
log = File.new("sinatra.log", "a+")
$stdout.reopen(log)
$stderr.reopen(log)

use Rack::ShowExceptions

run Rack::URLMap.new \
  "/"       => Sinatra::Application,
  "/resque" => Resque::Server.new
