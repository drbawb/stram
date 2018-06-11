class AddInetToToken < ActiveRecord::Migration[4.2]
  def self.up
    change_table :invite_tokens do |t|
      t.inet :client_ip
    end
  end

  def self.down
    change_table :invite_tokens do |t|
      t.remove :client_ip
    end
  end
end
