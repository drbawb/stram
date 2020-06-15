class TwitchToken < ActiveRecord::Base
  def is_expired?
    Time.now > self.valid_until
  end

  # a token is considered valid for login purposes if:
  #   - it has not been used to login before
  #   - it has not expired
  def is_valid?
    self.authorized_at.nil?
  end

  def perform_login!
    return unless self.is_valid?

    self.authorized_at = Time.now
    self.valid_until = self.authorized_at + 1.days
    self.save!
  end
end
