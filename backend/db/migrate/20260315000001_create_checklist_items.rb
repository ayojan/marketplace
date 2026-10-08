# frozen_string_literal: true

class CreateChecklistItems < ActiveRecord::Migration[8.0]
  def change
    create_table :checklist_items do |t|
      t.references :user, null: false, foreign_key: true
      t.string :title, null: false
      t.boolean :completed, default: false, null: false
      t.string :category
      t.date :due_date

      t.timestamps
    end

    add_index :checklist_items, [:user_id, :completed]
  end
end
