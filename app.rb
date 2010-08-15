require 'rubygems'
gem "rack", '~> 1.2.1'
require 'sinatra'
require 'action_view'
require 'sinatra/content_for'
require 'sinatra/ratpack'
require 'insightful'
require 'broadway'
require 'haml'
require 'json'
require 'open-uri'
require 'ubiquitously'
require 'resque'
require File.join(File.dirname(__FILE__), "job.rb")

@db = Redis.new

configure do
  LOGGER = Logger.new("tmp/development.log") 
  LOGGER.level = Logger::INFO
end
 
helpers do
  def logger
    LOGGER
  end
end

Ubiquitously.configure("config/_secret.yml")

helpers do
  include Insightful
  include ActionView::Helpers::TextHelper
  include ActionView::Helpers::TagHelper
  include ActionView::Helpers::SanitizeHelper
  extend ActionView::Helpers::SanitizeHelper::ClassMethods
  def nested_path(post)
    post.path
  end
end

this = File.expand_path(File.dirname(__FILE__))
SITE = Broadway.build(:source => "#{this}/_content", :settings => "#{this}/_config.yml")

enable :sessions
set :public, this
set :views, "views"

def urlify(url)
  url = "http://#{url}" if url !~ /^http/
  url
end

def create(params)
  data = {
    :url   => urlify(params["url"]),
    :title => params["title"],
    :tags  => params["tags"].split(/,(?:\s+)?/).map { |tag| tag.strip.downcase.gsub(/[^a-z0-9]/, "-").squeeze("-") },
    :description => params["description"],
    :username => "viatropos",
    :cookies_path => "config/_cookies.yml"
  }
  
  params["services"].each do |service|
    data[:service] = service
    logger.info("Ubiquitously") {"[queued] #{JSON.generate(data)}"}
    Resque.enqueue(Job, data)
    sleep 0.1
  end
  
  ""
end

get "/" do
  haml :index
end

post "/" do
  create(params)
end

post "/start" do
  begin
    url = urlify(params["url"])
    html = Nokogiri::HTML(open(url).read)
    title = html.xpath("//title").first.text.to_s.strip
    description = html.xpath("//meta[@name='description']").first["content"] rescue ""
    tags = html.xpath("//meta[@name='keywords']").first["content"] rescue ""
    tags = tags.split(",").map do |tag|
      tag.strip.downcase.gsub(/[^a-z0-9]/, "-").squeeze("-")
    end.join(", ")
    
    post = {
      :url         => url,
      :title       => title,
      :description => description,
      :tags        => tags
    }
    JSON.generate(post)
  rescue Exception => e
    puts e.backtrace
    "error"
  end
end

# [2010-08-15T12:57:39.157109 #75142]  INFO -- : [create:before] #<Ubiquitously::Digg::Post @url="http://apple.com" @title="Viatropos" @description="Creativity and Emergence. A personal blog about writing code that the world can leverage." @tags=["jquery", "html-5", "css3", "ajax", "ruby-on-rails", "ruby-on-rails-developer", "ruby-on-rails-examples", "rails-deployment", "flex", "actionscript", "flash", "open-source"]>
post "/finish" do
  create(params)
end

get "/*" do
  ""
end

not_found do
  ""
end