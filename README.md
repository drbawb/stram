For twitch auth integration you need to set the following in your shell's environment:

```
TWITCH_CLIENT_ID=<your app's client ID>
TWITCH_CLIENT_SECRET=<your app's current client secret>
```

Basic usage instructions:

- install ruby 2.4
- install bundler 1.17.x w/ `gem install bundler`
- clone this repo, cd to it
- install dependencies w/ `bundle install`
- run the server w/ `bundle exec padrino start -h <listen IP> -p <listen port>`
- cry a little

Admin notes:

- You will need to change the config variable in `public/javascripts/stream.js` to match
  your environment.

- You will need to setup a server which serves the HLS (HTTP Live Streaming) segments.
  An example stack, which has been tested w/ this software, looks something like:

  - `nginx` HTTP server w/ the `nginx-rtmp-module`
  - An RTMP source, `ffmpeg` or `OBS` work well.
  - If this HLS server is on another origin you will need to setup 
    CORS headers in the `nginx` configuraiton
