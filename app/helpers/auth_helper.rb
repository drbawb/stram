module Stram
  class App
    module AuthHelper
      TWITCH_REDIRECT_URI="http://valestream.fatalsyntax.com/auth/twitch/callback"

      def client
        OAuth2::Client.new(ENV["TWITCH_CLIENT_ID"], 
                           ENV["TWITCH_CLIENT_SECRET"],
                           site: "https://api.twitch.tv",
                           authorize_url: "/kraken/oauth2/authorize",
                           token_url: "/kraken/oauth2/token")
      end


      def refresh_session
        if Time.now > session[:twitch_expires]
          logger.info "refreshing access token ..."

          login_opts = {
            client_id: ENV["TWITCH_CLIENT_ID"],
            client_secret: ENV["TWITCH_CLIENT_SECRET"],
            refresh_token: session[:twitch_token]["refresh_token"],
            grant_type: "refresh_token",
            redirect_uri: TWITCH_REDIRECT_URI
          }

          # get an authorization token
          auth_uri = URI::HTTPS.build(host: "api.twitch.tv",
                                      path: "/kraken/oauth2/token")

          response = HTTP.post(auth_uri, params: login_opts)
          logger.debug response.body
          token    = JSON.parse(response.body)
          logger.debug "got twitch token :: #{token.to_s}"
          session[:twitch_token] = token
        end
      end

      def is_twitch_sub
        refresh_session
        token = session[:twitch_token]
        
        # use authorization to check channel sub
        oauth_opts = {"Client-ID": ENV["TWITCH_CLIENT_ID"], "Authorization" => "OAuth #{token["access_token"]}"}
        response  = HTTP.headers(oauth_opts).get("https://api.twitch.tv/kraken")
        user      = JSON.parse(response)
        user_name = user["token"]["user_name"]

        response = HTTP.headers(oauth_opts).get("https://api.twitch.tv/kraken/users/#{user_name}/subscriptions/vale")
        sub      = JSON.parse(response)
        logger.debug "got sub :: #{sub.to_s}"

        sub["error"].nil? and not sub["_id"].nil?
      end
    end

    helpers AuthHelper
  end
end
