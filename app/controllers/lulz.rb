Stram::App.controllers :lulz do

  # fetches a signed "style token" for barcode text
  get :barcode, with: :uid do
    allowed_ids = ["47735570", "81500175"]
    logger.debug "wtf ??? #{session[:twitch_id]}"

    if session[:is_auth] && allowed_ids.include?(session[:twitch_id])
      msg    = {uid: params["uid"], style: "barcode" }.to_json
      digest = OpenSSL::Digest.new("sha1")
      hmac   = OpenSSL::HMAC.digest(digest, "foo", msg) # TODO: shared secret
    else
      halt 401
    end
  end

  # get :index, :map => '/foo/bar' do
  #   session[:foo] = 'bar'
  #   render 'index'
  # end

  # get :sample, :map => '/sample/url', :provides => [:any, :js] do
  #   case content_type
  #     when :js then ...
  #     else ...
  # end

  # get :foo, :with => :id do
  #   "Maps to url '/foo/#{params[:id]}'"
  # end

  # get '/example' do
  #   'Hello world!'
  # end
  

end
