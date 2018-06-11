class AddNameToToken < ActiveRecord::Migration[4.2]
  def self.up
    change_table :invite_tokens do |t|
      t.rename :token, :secret
      t.string :name
    end
  end

  def self.down
    change_table :invite_tokens do |t|
      t.rename :secret, :token
      t.remove :name
    end
  end
end
