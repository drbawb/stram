module Stram
  class App
    module AuthHelper
      TWITCH_VALE_ID=27645199
      TWITCH_REDIRECT_URI="http://valestream.fatalsyntax.com/auth/twitch/callback"

      MODS = [
        "166713997", # m_ichelle
        "164390292", # linz87
        "129190457", # skyshock101
        "134640094", # shrdluuu
        "178144832", # charms1960
        "42367965",  # gabbydarko
        "47735570",  # hime
      ]

      def client
        OAuth2::Client.new(ENV["TWITCH_CLIENT_ID"], 
                           ENV["TWITCH_CLIENT_SECRET"],
                           site: "https://id.twitch.tv",
                           authorize_url: "/oauth2/authorize",
                           token_url: "/oauth2/token")
      end

      def clear_session
        session[:is_auth] = false
       
        # clear twitch flags 
        session[:is_subscriber] = false
        session[:twitch_user]   = nil
        session[:twitch_name]   = nil
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
            auth_uri = URI::HTTPS.build(host: "id.twitch.tv",
                                        path: "/oauth2/token")
            
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
        is_vale || MODS.include?(session[:twitch_id])
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
          "Authorization" => "Bearer #{token["access_token"]}",
          "Accept" => "application/vnd.twitchtv.v6+json"
        }


        user_uri = URI::HTTPS.build(host: "api.twitch.tv", path: "/helix/users")
        response = HTTP.headers(oauth_opts).get(user_uri)
        logger.debug "is sub user resp #{response.to_s}"
        return false unless response.code == 200

        user = JSON.parse(response)["data"][0]
        session[:twitch_name] = user["display_name"]
        logger.debug "is sub user :: #{user}"


        begin
          # check if they exist in our table
          valid_until = TwitchToken.arel_table[:valid_until]
          tt = TwitchToken
            .where(twitch_id: user["login"])
            .where(valid_until.gteq(Time.now).or(valid_until.eq(nil)))
            .order(created_at: :asc) # use "oldest" token first
            .first

          if tt.nil?

            sub_uri = URI::HTTPS.build(host: "api.twitch.tv",
                                       path: "/helix/subscriptions/user",
                                       query: "broadcaster_id=#{TWITCH_VALE_ID}&user_id=#{session[:twitch_id]}")


            response  = HTTP.headers(oauth_opts).get(sub_uri)

            # check if they are subscribed
            response = HTTP.headers(oauth_opts).get(sub_uri)
            return false unless response.code == 200
            sub = JSON.parse(response)
            logger.debug "got sub :: #{sub.to_s}"
            logger.debug "sub_uri :: #{sub_uri}"

            sub["error"].nil? and not sub["data"].nil?
          else
            # use token & validate expiration date
            tt.perform_login!
            not tt.is_expired?
          end
        rescue JSON::ParserError => err
          logger.warn "failed to get subscriber response"
          false
        end
      end
    end

    helpers AuthHelper
  end
end
