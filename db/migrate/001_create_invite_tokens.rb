class CreateInviteTokens < ActiveRecord::Migration[4.2]
  def self.up
    create_table :invite_tokens do |t|
      t.string :token
      t.datetime :authorized_at
      t.datetime :valid_until
      t.timestamps null: false
    end
  end

  def self.down
    drop_table :invite_tokens
  end
end
