require 'rubygems'
require 'resque'
require 'ubiquitously'

module Job
  @queue = :default
  
  def self.logger
    unless @logger
      @logger = Logger.new("tmp/development.log")
      @logger.level = Logger::INFO
    end
    
    @logger
  end
  
  def self.perform(params)
    json = JSON.generate(params)
    Ubiquitously.configure("config/_secret.yml")
    logger.info("Ubiquitously") {"[create:before] #{json}"}
    
    user = Ubiquitously::User.new(
      :username => "viatropos",
      :cookies_path => "config/_cookies.yml"
    )
    
    post = Ubiquitously::Post.new(
      :url => params["url"],
      :title => params["title"],
      :description => params["description"],
      :tags => params["tags"],
      :user => user,
      :categories => params["tags"]
    )
    
    begin
      result = post.save(params["service"])
    rescue Exception => e
      puts e.inspect
      puts e.backtrace
    end
    
    # post.save do |captcha|
    #   if captcha
    #     logger.info("Ubiquitously") {"[captcha] #{JSON.generate(params)}"}
    #   else
    #     logger.info("Ubiquitously") {"[create:after] #{JSON.generate(params)}"}
    #   end
    # end
    logger.info("Ubiquitously") {"[create:after] #{json}"}
  end
end

module FailingJob
  @queue = :failing

  def self.perform(params)
    sleep 1
    raise 'not processable!'
    puts "Processed a job!"
  end
end
