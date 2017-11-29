module Stram
  class App
    module AuthHelper
      TWITCH_VALE_ID=27645199
      TWITCH_REDIRECT_URI="http://valestream.fatalsyntax.com/auth/twitch/callback"

      def client
        OAuth2::Client.new(ENV["TWITCH_CLIENT_ID"], 
                           ENV["TWITCH_CLIENT_SECRET"],
                           site: "https://api.twitch.tv",
                           authorize_url: "/kraken/oauth2/authorize",
                           token_url: "/kraken/oauth2/token")
      end

      def clear_session
        session[:is_auth] = false
       
        # clear twitch flags 
        session[:is_subscriber] = false
        session[:twitch_user]   = nil
        session[:twitch_id]     = nil
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
          begin 
            auth_uri = URI::HTTPS.build(host: "api.twitch.tv",
                                        path: "/kraken/oauth2/token")
            
            response = HTTP.post(auth_uri, params: login_opts)
            logger.debug response.body
            token    = JSON.parse(response.body)
            logger.debug "got twitch token :: #{token.to_s}"
            session[:twitch_token] = token
          rescue JSON::ParserError => err
            logger.warn "error w/ refresh token response: #{err}"
            clear_session()
          end
        end
      end

      def is_admin
        is_vale || "47735570" == session[:twitch_id]
      end

      def is_vale
        TWITCH_VALE_ID == session[:twitch_id]
      end

      def is_token_user
        t = InviteToken.where(secret: session[:is_auth]).first
        (not t.nil?) && (not t.is_expired?)
      end

      def is_twitch_sub
        return false unless session[:twitch_id]

        refresh_session
        token = session[:twitch_token]
        
        # use authorization to check channel sub
        oauth_opts = {
          "Client-ID": ENV["TWITCH_CLIENT_ID"],
          "Authorization" => "OAuth #{token["access_token"]}",
          "Accept" => "application/vnd.twitchtv.v5+json"
        }
        response  = HTTP.headers(oauth_opts).get("https://api.twitch.tv/kraken")
        user      = JSON.parse(response)
        user_name = user["token"]["user_id"]
        
        begin
          sub_uri  = "https://api.twitch.tv/kraken/users/#{user_name}/subscriptions/#{TWITCH_VALE_ID}"
          logger.debug sub_uri
          logger.debug oauth_opts.inspect
          response = HTTP.headers(oauth_opts).get(sub_uri)
          sub      = JSON.parse(response)
          logger.debug "got sub :: #{sub.to_s}"
          logger.debug "sub_uri :: #{sub_uri}"

          sub["error"].nil? and not sub["_id"].nil?
        rescue JSON::ParserError => err
          logger.warn "failed to get subscriber response"
          false
        end
      end
    end

    helpers AuthHelper
  end
end
