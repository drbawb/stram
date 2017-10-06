Stram::App.controllers :dash do
  # get :hls, :map => '/old' do
  #   render "dash/index"
  # end

  get :vjs, :map => '/' do
    if session[:is_subscriber]
      render "dash/safari"
    elsif session[:is_auth]
      redirect url_for(:auth, :no_sub)
    else
      redirect url_for(:auth, :new)
    end
  end

  # get :test do
  #   render "dash/testauth"
  # end

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
