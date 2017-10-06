For twitch auth integration you need to set the following in your shell's environment:

```
TWITCH_CLIENT_ID=<your app's client ID>
TWITCH_CLIENT_SECRET=<your app's current client secret>
```


Basic usage instructions:

- install ruby 2.4
- install bundler w/ `gem install bundler`
- clone this repo, cd to it
- install dependencies w/ `bundle install`
- run the server w/ `bundle exec padrino start -h <listen IP> -p <listen port>`
- cry a little
