class InviteToken < ActiveRecord::Base
  validates :valid_until, presence: true
  validate :expires_in_future, on: :create

  def is_expired?
    Time.now > self.valid_until
  end

  # a token is considered valid for login purposes if:
  #   - it has not been used to login before
  #   - it has not expired
  def is_valid?
    (not self.is_expired?) && (self.authorized_at.nil?)
  end

  def perform_login!
    return unless self.is_valid?
    self.authorized_at = Time.now
    self.valid_until = self.authorized_at + 1.days
    self.save!
  end

  private
  def expires_in_future
    if valid_until < Time.now
      errors.add(:valid_until, "must be in the future.")
    end
  end

end
