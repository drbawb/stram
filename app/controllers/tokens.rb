Stram::App.controllers :tokens do

  before except: :show do
    unless is_admin
      flash[:error] = "You do not have permission to access that page." 
      redirect url_for(:auth, :new)
      halt
    end
  end

  get :index do
    @tokens = InviteToken.all
    render "index"
  end

  get :show, with: :secret do
    @token = InviteToken.where(secret: params[:secret]).first

    if (not @token.nil?) && (@token.is_valid? || @token.client_ip == request.ip)
      render "show"
    else
      flash[:error] = "Sorry, that token is not valid"
      redirect url_for(:auth, :new)
    end
  end

  get :new do
    @token = InviteToken.new
    @token.valid_until = Time.now.getutc + 1.day

    render "new"
  end

  post :create do
    @token = InviteToken.new(params[:invite_token])
    @token.secret = SecureRandom.hex[0..16]
    
    if (@token.save rescue false)
      redirect url_for(:tokens, :index)
    else
      flash.now[:error] = "... hime~ gets the hose again."
      render "new"
    end
  end

  post :reset, with: :id do
    @token = InviteToken.find(params[:id])
    @token.authorized_at = nil
    unless (@token.save rescue false)
      flash[:error] = "... hime~ gets the hose again."
    end

    redirect url_for(:tokens, :index)
  end

  delete :destroy, with: :id do
    @token = InviteToken.find(params[:id])
    @token.delete
    redirect url_for(:tokens, :index)
  end

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
