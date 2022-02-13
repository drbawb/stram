module Stram
  class App
    module ApiHelper
      def api_check_key(key)
        if ENV["BOTMAIN_API_KEY"].nil? or ENV["BOTMAIN_API_KEY"].empty?
          logger.warn "API called, but API key is not set."
          return false
        end

        return ENV["BOTMAIN_API_KEY"].eql? key
      end
    end

    helpers ApiHelper
  end
end

