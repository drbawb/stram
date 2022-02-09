# vale login id: 27645199

TWITCH_REDIRECT_URI=Stram::App::AuthHelper::TWITCH_REDIRECT_URI
TWITCH_VALE_ID=Stram::App::AuthHelper::TWITCH_VALE_ID

Stram::App.controllers :auth do
  get :logout do
    clear_session()
    redirect url_for(:dash, :vjs)
  end

  post :token, with: :secret do
    @token = InviteToken.where(secret: params[:secret]).first
	if (not @token.nil?) && (@token.is_valid? || @token.client_ip == request.ip)
	  # NOTE: don't forget to whitelist params if you do an #update_attributes() here
      # let them in
      @token.name      = params[:invite_token][:name]
      @token.client_ip = request.ip
      @token.perform_login!
      session[:is_auth]     = @token.secret
      session[:twitch_user] = @token.name

      redirect url_for(:dash, :vjs)
    elsif (not @token.nil?) && (not @token.is_valid?)
      flash[:error] = "Sorry, this token has expired or cannot be used on this device."
      redirect url_for(:auth, :new)
    else
      flash[:error] = "Sorry, that token does not exist."
      redirect url_for(:auth, :new)
    end
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
    auth_uri = URI::HTTPS.build(host: "id.twitch.tv",
                                path: "/oauth2/token")

    response = HTTP.post(auth_uri, params: login_opts)
    token    = JSON.parse(response.body)
    logger.debug "got twitch token :: #{token.to_s}"
    logger.debug token["expires_in"]

    # use authorization to check channel sub
    oauth_opts = {
      "Client-ID": ENV["TWITCH_CLIENT_ID"],
      "Authorization" => "Bearer #{token["access_token"]}",
      "Accept" => "application/vnd.twitchtv.v6+json"
    }


    # load user profile data
    response  = HTTP.headers(oauth_opts).get("https://api.twitch.tv/helix/users")
    user      = JSON.parse(response)

    logger.debug "got twitch user :: #{user.to_s}"
    display_name = user["data"][0]["display_name"]
    user_name = user["data"][0]["login"]
    user_id   = user["data"][0]["id"]

    session[:is_auth]        = user_name
    session[:twitch_token]   = token
    session[:twitch_user]    = user_name
    session[:twitch_name]    = display_name
    session[:twitch_id]      = user_id
    session[:twitch_expires] = Time.now + token["expires_in"]

    logger.warn "csrf match? #{session[:state] == params[:state]} (#{session[:state]} == #{params[:state]})"

    redirect url_for(:dash, :vjs)
  end

  get :twitch do
    session[:state] = SecureRandom.base64
    redirect client.auth_code.authorize_url(redirect_uri: TWITCH_REDIRECT_URI, 
                                            state: session[:state],
                                            scope: "user_subscriptions")
  end

  get :new do
    render "auth/new"
  end  

  get :no_sub do
    render "auth/no_sub"
  end

end
