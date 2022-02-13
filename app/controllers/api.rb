Stram::App.controllers :api do

  post :twitch_token, with: :user_id, provides: :json, csrf_protection: false do

    # verify the authorization matches the bot api key
    unless api_check_key(request.env["HTTP_AUTHORIZATION"])
      response = {success: false, message: "Unauthorized API key."}
      halt 403, response.to_json
    end

    # get an authorization token
    login_opts = {
      client_id: ENV["TWITCH_CLIENT_ID"],
      client_secret: ENV["TWITCH_CLIENT_SECRET"],
      grant_type: "client_credentials",
      scope: "user_read",
    }

    auth_uri = URI::HTTPS.build(host: "id.twitch.tv",
                                path: "/oauth2/token")

    response = HTTP.post(auth_uri, params: login_opts)

    if response.code != 200
      logger.error "twitch api response [#{response.code}]: #{response}"
      response = {success: false, message: "Unable to authenticate to twitch API."}
      halt 500, response.to_json
    end

    token    = JSON.parse(response.body)
    logger.debug "got twitch token :: #{token.to_s}"
    logger.debug token["expires_in"]

    # use twitch id to get their profile details
    oauth_opts = {
      "Client-ID": ENV["TWITCH_CLIENT_ID"],
      "Authorization": "Bearer #{token["access_token"]}"
    }


    logger.debug "fetching twitch profile for user #{params[:user_id]}"
    profile_uri = URI::HTTPS.build(host: "api.twitch.tv",
                                   path: "/helix/users",
                                   query: "id=#{params[:user_id]}")

    response  = HTTP.headers(oauth_opts).get(profile_uri)

    if response.code == 404
      response = {success: false, message: "User profile #{params[:user_id]} not found."}
      halt 404, response.to_json
    end

    if response.code != 200
      logger.error "#{response.code} error from URI #{profile_uri}"
      response = {success: false, message: "Error contacting twitch API for profile data."}
      halt 500, response.to_json
    end

    user      = JSON.parse(response)["data"][0]
    user_id   = user["id"]
    user_name = user["login"]

    # create a new token for this twitch profile
    logger.debug "creating twitch token for #{user_name} (#{user_id})"
    tt = TwitchToken.new(username: user_name, twitch_id: user_id)
    if tt.save
      {success: true, token_id: tt.id}.to_json
    else
      {success: false, message: "Error saving token to database for requested ID #{params[:user_id]}."}.to_json
    end
  end
end
