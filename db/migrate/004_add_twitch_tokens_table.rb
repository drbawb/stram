class AddTwitchTokensTable < ActiveRecord::Migration[6.0]
  def self.up
    create_table :twitch_tokens do |t|
      t.string :username
      t.string :twitch_id

      t.datetime :authorized_at
      t.datetime :valid_until
      t.timestamps null: false
    end
  end

  def self.down
    drop_table :twitch_tokens
  end
end
