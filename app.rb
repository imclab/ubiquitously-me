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
  puts params.inspect
  user = Ubiquitously::User.new(
    :username => "viatropos",
    :cookies_path => "config/_cookies.yml"
  )
  tags = params["tags"].split(/,\s+/) if params["tags"]
  post = Ubiquitously::Post.new(
    :url => urlify(params["url"]),
    :title => params["title"],
    :description => params["description"],
    :tags => tags,
    :user => user,
    :categories => tags
  )
  result = post.save(params["services"])
  JSON.generate(params)
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

post "/finish" do
  create(params)
end

get "/*" do
  ""
end

not_found do
  ""
end