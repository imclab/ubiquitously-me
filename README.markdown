# Ubiquitously.me

This is a reference implementation of [Ubiquitously](http://github.com/viatropos/ubiquitously).  I use this to share content to multiple places without retyping a thing.  It requires a lot of resources and time per request because each service uses Mechanize to programmatically submit forms and sometimes this could be 4 or 5 pages to parse, plus a few redirects.

If you're brave and have cash, feel free to make this into a _free_ service for autoposting _everywhere_ (much much more than OnlyWire).  You'd have to use delayed job and have a push server so a) there's no delay on the interface, and b) you're notified when the post is finally submitted.  That's a lot more complicated than just processing the requests in one swoop and taking the non-scalable performance hit.  Perfect for individual use, not good at all as a service.  Maybe I'll do this if it works well.

## Todo

- Redis and Resque, node.js calls resque and tells you what the status is.
- If a post requires you to fill out a captcha, return JSON with the captcha url, and show it in a popup.  Then re-submit the form, but without having to rebuild the form; i.e. the JSON should have everything Mechanize needs to submit the form.
- Show which services you can post others' content to vs. your content
- Iconize all the services

- http://www.creditscore.net/credit-money/