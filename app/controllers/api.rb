Stram::App.controllers :api do

  post :twitch_token, with: :user_id, provides: :json, csrf_protection: false do
    # verify the authorization matches the bot api key
    auth_header = request.env["HTTP_AUTHORIZATION"]
    
    if not auth_header&.eql? ENV["BOTMAIN_API_KEY"]
      logger.info "header: #{auth_header}"
      logger.info "api key: #{ENV["BOTMAIN_API_KEY"]}"
      response = {success: false, message: "Unauthorized API key."}
      halt 403, response.to_json
    end

    # use twitch id to get their profile details
    oauth_opts = {
      "Client-ID": ENV["TWITCH_CLIENT_ID"],
      "Accept" => "application/vnd.twitchtv.v5+json"
    }
    
    response  = HTTP.headers(oauth_opts).get("https://api.twitch.tv/kraken/users/#{params[:user_id]}")
    user      = JSON.parse(response)
    user_name = user["name"]
    user_id   = user["_id"]
 
    # create a new token for this twitch profile 
    logger.info "tt :: #{user_name} @ #{user_id}"
    tt = TwitchToken.new(username: user_name, twitch_id: user_id)
    if tt.save
      {success: true, token_id: tt.id}.to_json
    else
      {success: false, message: "Error saving token to database for requested ID #{params[:user_id]}."}.to_json
    end
  end
end
