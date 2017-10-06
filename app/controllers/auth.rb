# vale login id: 27645199

TWITCH_REDIRECT_URI="http://valestream.fatalsyntax.com/auth/twitch/callback"

Stram::App.controllers :auth do
  get :logout do
    session[:is_auth] = false
    session[:is_subscriber] = false
    redirect url_for(:dash, :vjs)
  end

  get :callback, :map => "/auth/twitch/callback" do
    # exchange autorization code for access token
    login_opts = {
      client_id: ENV["TWITCH_CLIENT_ID"],
      client_secret: ENV["TWITCH_CLIENT_SECRET"],
      code: params["code"],
      grant_type: "authorization_code",
      redirect_uri: TWITCH_REDIRECT_URI
    }

    # get an authorization token
    auth_uri = URI::HTTPS.build(host: "api.twitch.tv",
                                path: "/kraken/oauth2/token")

    response = Net::HTTP.post_form(auth_uri, login_opts)
    token    = JSON.parse(response.body)
    logger.debug "got twitch token :: #{token.to_s}"

    # use authorization to check channel sub
    oauth_opts = {"Client-ID": ENV["TWITCH_CLIENT_ID"], "Authorization" => "OAuth #{token["access_token"]}"}
    response  = HTTP.headers(oauth_opts).get("https://api.twitch.tv/kraken")
    user      = JSON.parse(response)
    user_name = user["token"]["user_name"]

    response = HTTP.headers(oauth_opts).get("https://api.twitch.tv/kraken/users/#{user_name}/subscriptions/vale")
    sub      = JSON.parse(response)
    logger.debug "got sub :: #{sub.to_s}"

    session[:is_auth]       = true
    session[:is_subscriber] = sub["error"].nil? and not sub["_id"].nil?
    redirect url_for(:dash, :vjs)
  end

  get :twitch do
    login_opts = {
      client_id: ENV["TWITCH_CLIENT_ID"],
      redirect_uri: TWITCH_REDIRECT_URI,
      response_type: "code",
      scope: "openid user_subscriptions"
    }

    auth_uri = URI::HTTPS.build(host: "api.twitch.tv", 
                                path: "/kraken/oauth2/authorize",
                                query: URI.encode_www_form(login_opts))

    redirect auth_uri
  end

  get :new do
    render "auth/new"
  end  

  get :no_sub do
    render "auth/no_sub"
  end

end
