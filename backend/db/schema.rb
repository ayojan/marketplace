# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2026_10_26_031700) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_stat_statements"
  enable_extension "pgcrypto"
  enable_extension "plpgsql"
  enable_extension "uuid-ossp"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "admin_users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
  end

  create_table "auth_identities", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "provider", null: false
    t.string "uid", null: false
    t.string "email"
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["provider", "uid"], name: "index_auth_identities_on_provider_and_uid", unique: true
    t.index ["user_id", "provider"], name: "index_auth_identities_on_user_id_and_provider", unique: true
    t.index ["user_id"], name: "index_auth_identities_on_user_id"
  end

  create_table "availability_slots", force: :cascade do |t|
    t.bigint "vendor_id", null: false
    t.date "date", null: false
    t.time "start_time", null: false
    t.time "end_time", null: false
    t.boolean "is_available", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["date", "is_available"], name: "index_availability_slots_on_date_and_is_available"
    t.index ["vendor_id", "date"], name: "index_availability_slots_on_vendor_id_and_date"
    t.index ["vendor_id"], name: "index_availability_slots_on_vendor_id"
  end

  create_table "booking_messages", force: :cascade do |t|
    t.bigint "booking_id", null: false
    t.bigint "sender_id", null: false
    t.text "message", null: false
    t.datetime "sent_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id", "sent_at"], name: "index_booking_messages_on_booking_id_and_sent_at"
    t.index ["booking_id"], name: "index_booking_messages_on_booking_id"
    t.index ["sender_id"], name: "index_booking_messages_on_sender_id"
  end

  create_table "bookings", force: :cascade do |t|
    t.bigint "customer_id", null: false
    t.bigint "vendor_id", null: false
    t.bigint "service_id", null: false
    t.datetime "event_date", null: false
    t.datetime "event_end_date"
    t.string "event_duration"
    t.string "event_location", null: false
    t.decimal "total_amount", precision: 10, scale: 2, null: false
    t.string "status", default: "pending", null: false
    t.text "requirements"
    t.text "special_instructions"
    t.datetime "booking_reminder_sent_at"
    t.datetime "vendor_first_response_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_reminder_sent_at"], name: "index_bookings_on_booking_reminder_sent_at"
    t.index ["customer_id", "status"], name: "index_bookings_on_customer_id_and_status"
    t.index ["customer_id"], name: "index_bookings_on_customer_id"
    t.index ["event_date"], name: "index_bookings_on_event_date"
    t.index ["service_id", "status"], name: "index_bookings_on_service_id_and_status"
    t.index ["service_id"], name: "index_bookings_on_service_id"
    t.index ["vendor_first_response_at"], name: "index_bookings_on_vendor_first_response_at"
    t.index ["vendor_id", "status", "event_date"], name: "index_bookings_vendor_status_date"
    t.index ["vendor_id", "vendor_first_response_at", "created_at"], name: "index_bookings_vendor_response_time"
    t.index ["vendor_id"], name: "index_bookings_on_vendor_id"
    t.check_constraint "vendor_first_response_at IS NULL OR vendor_first_response_at >= created_at", name: "check_vendor_response_after_creation"
  end

  create_table "categories", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.string "slug"
    t.boolean "active", default: true
    t.string "icon"
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "to_tsvector('english'::regconfig, (COALESCE(name, ''::character varying))::text)", name: "index_categories_on_name_tsvector", using: :gin
    t.index ["slug"], name: "index_categories_on_slug", unique: true
  end

  create_table "checklist_items", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", null: false
    t.boolean "completed", default: false, null: false
    t.string "category"
    t.date "due_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "completed"], name: "index_checklist_items_on_user_id_and_completed"
    t.index ["user_id"], name: "index_checklist_items_on_user_id"
  end

  create_table "customer_favorites", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.bigint "vendor_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id", "vendor_id"], name: "index_customer_favorites_on_user_id_and_vendor_id", unique: true
    t.index ["user_id"], name: "index_customer_favorites_on_user_id"
    t.index ["vendor_id"], name: "index_customer_favorites_on_vendor_id"
  end

  create_table "email_notification_preferences", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.boolean "booking_created", default: true, null: false
    t.boolean "booking_accepted", default: true, null: false
    t.boolean "booking_rejected", default: true, null: false
    t.boolean "booking_cancelled", default: true, null: false
    t.boolean "booking_reminder", default: true, null: false
    t.boolean "new_message", default: true, null: false
    t.boolean "review_received", default: true, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["user_id"], name: "index_email_notification_preferences_on_user_id", unique: true
  end

  create_table "in_app_notifications", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "title", limit: 255, null: false
    t.text "message", null: false
    t.string "notification_type", limit: 50, null: false
    t.string "related_type", limit: 50
    t.bigint "related_id"
    t.boolean "is_read", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["is_read"], name: "index_in_app_notifications_on_is_read"
    t.index ["notification_type"], name: "index_in_app_notifications_on_notification_type"
    t.index ["related_type", "related_id"], name: "index_notifications_on_polymorphic"
    t.index ["user_id", "is_read", "created_at"], name: "idx_notifications_user_read_date"
    t.index ["user_id"], name: "index_in_app_notifications_on_user_id"
    t.check_constraint "related_type IS NULL OR (related_type::text = ANY (ARRAY['Booking'::character varying::text, 'Review'::character varying::text, 'BookingMessage'::character varying::text]))", name: "check_notification_related_type_valid"
  end

  create_table "portfolio_items", force: :cascade do |t|
    t.bigint "vendor_id", null: false
    t.string "title", null: false
    t.text "description"
    t.string "category", null: false
    t.integer "display_order", default: 0, null: false
    t.boolean "is_featured", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_portfolio_items_on_category"
    t.index ["vendor_id", "category"], name: "index_portfolio_items_on_vendor_id_and_category"
    t.index ["vendor_id", "display_order"], name: "index_portfolio_items_on_vendor_id_and_display_order"
    t.index ["vendor_id", "is_featured"], name: "index_portfolio_items_on_vendor_id_and_is_featured"
    t.index ["vendor_id"], name: "index_portfolio_items_on_vendor_id"
  end

  create_table "review_votes", force: :cascade do |t|
    t.bigint "review_id", null: false
    t.bigint "voter_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["review_id", "voter_id"], name: "index_review_votes_on_review_id_and_voter_id", unique: true
    t.index ["review_id"], name: "index_review_votes_on_review_id"
    t.index ["voter_id", "created_at"], name: "index_review_votes_on_voter_id_and_created_at"
    t.index ["voter_id"], name: "index_review_votes_on_voter_id"
  end

  create_table "reviews", force: :cascade do |t|
    t.bigint "booking_id", null: false
    t.bigint "customer_id", null: false
    t.bigint "vendor_id", null: false
    t.bigint "service_id", null: false
    t.integer "rating", null: false
    t.integer "quality_rating"
    t.integer "communication_rating"
    t.integer "value_rating"
    t.integer "punctuality_rating"
    t.text "comment"
    t.string "status", default: "published"
    t.text "vendor_response"
    t.datetime "vendor_responded_at"
    t.integer "helpful_votes", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["booking_id"], name: "index_reviews_on_booking_id", unique: true
    t.index ["customer_id"], name: "index_reviews_on_customer_id"
    t.index ["rating"], name: "index_reviews_on_rating"
    t.index ["service_id", "status"], name: "index_reviews_on_service_id_and_status"
    t.index ["service_id"], name: "index_reviews_on_service_id"
    t.index ["status"], name: "index_reviews_on_status"
    t.index ["vendor_id", "helpful_votes"], name: "index_reviews_on_vendor_id_and_helpful_votes", order: { helpful_votes: :desc }
    t.index ["vendor_id", "status", "helpful_votes"], name: "index_reviews_helpful_by_vendor_and_status", order: { helpful_votes: :desc }
    t.index ["vendor_id", "status"], name: "index_reviews_on_vendor_id_and_status"
    t.index ["vendor_id", "vendor_responded_at"], name: "index_reviews_on_vendor_id_and_vendor_responded_at"
    t.index ["vendor_id"], name: "index_reviews_on_vendor_id"
    t.check_constraint "helpful_votes >= 0", name: "check_helpful_votes_non_negative"
  end

  create_table "service_categories", force: :cascade do |t|
    t.bigint "service_id", null: false
    t.bigint "category_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_service_categories_on_category_id"
    t.index ["service_id", "category_id"], name: "index_service_categories_on_service_id_and_category_id", unique: true
    t.index ["service_id"], name: "index_service_categories_on_service_id"
  end

  create_table "service_images", force: :cascade do |t|
    t.bigint "service_id", null: false
    t.string "title"
    t.text "description"
    t.string "alt_text"
    t.integer "display_order", default: 0
    t.boolean "is_primary", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["service_id", "display_order"], name: "index_service_images_on_service_id_and_display_order"
    t.index ["service_id", "is_primary"], name: "index_service_images_on_service_id_and_is_primary"
    t.index ["service_id"], name: "index_service_images_on_service_id"
  end

  create_table "services", force: :cascade do |t|
    t.bigint "vendor_id", null: false
    t.string "name"
    t.text "description"
    t.decimal "base_price", precision: 10, scale: 2
    t.string "pricing_type", default: "hourly"
    t.string "status", default: "draft"
    t.decimal "average_rating", precision: 3, scale: 2, default: "0.0"
    t.integer "total_reviews", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.virtual "search_vector", type: :tsvector, as: "(setweight(to_tsvector('english'::regconfig, (COALESCE(name, ''::character varying))::text), 'A'::\"char\") || setweight(to_tsvector('english'::regconfig, COALESCE(description, ''::text)), 'B'::\"char\"))", stored: true
    t.index ["average_rating"], name: "index_services_on_average_rating"
    t.index ["search_vector"], name: "index_services_on_search_vector", using: :gin
    t.index ["status"], name: "index_services_on_status"
    t.index ["vendor_id", "status"], name: "index_services_on_vendor_id_and_status"
    t.index ["vendor_id"], name: "index_services_on_vendor_id"
  end

  create_table "solid_cache_entries", force: :cascade do |t|
    t.binary "key", null: false
    t.binary "value", null: false
    t.datetime "created_at", null: false
    t.bigint "key_hash", null: false
    t.integer "byte_size", null: false
    t.index ["byte_size"], name: "index_solid_cache_entries_on_byte_size"
    t.index ["key_hash", "byte_size"], name: "index_solid_cache_entries_on_key_hash_and_byte_size"
    t.index ["key_hash"], name: "index_solid_cache_entries_on_key_hash", unique: true
  end

  create_table "solid_queue_batch_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.bigint "batch_id", null: false
    t.datetime "created_at", null: false
    t.index ["batch_id"], name: "index_solid_queue_batch_executions_on_batch_id"
    t.index ["job_id"], name: "index_solid_queue_batch_executions_on_job_id", unique: true
  end

  create_table "solid_queue_batches", force: :cascade do |t|
    t.string "active_job_batch_id"
    t.string "description"
    t.text "on_finish"
    t.text "on_success"
    t.text "on_failure"
    t.text "metadata"
    t.integer "total_jobs", default: 0, null: false
    t.integer "completed_jobs", default: 0, null: false
    t.integer "failed_jobs", default: 0, null: false
    t.datetime "enqueued_at"
    t.datetime "finished_at"
    t.datetime "failed_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["active_job_batch_id"], name: "index_solid_queue_batches_on_active_job_batch_id", unique: true
    t.index ["finished_at"], name: "index_solid_queue_batches_on_finished_at"
  end

  create_table "solid_queue_blocked_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.string "concurrency_key", null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.index ["concurrency_key", "priority", "job_id"], name: "index_solid_queue_blocked_executions_for_release"
    t.index ["expires_at", "concurrency_key"], name: "index_solid_queue_blocked_executions_for_maintenance"
    t.index ["job_id"], name: "index_solid_queue_blocked_executions_on_job_id", unique: true
  end

  create_table "solid_queue_claimed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.bigint "process_id"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_claimed_executions_on_job_id", unique: true
    t.index ["process_id", "job_id"], name: "index_solid_queue_claimed_executions_on_process_id_and_job_id"
  end

  create_table "solid_queue_failed_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.text "error"
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_failed_executions_on_job_id", unique: true
  end

  create_table "solid_queue_jobs", force: :cascade do |t|
    t.string "queue_name", null: false
    t.string "class_name", null: false
    t.text "arguments"
    t.integer "priority", default: 0, null: false
    t.string "active_job_id"
    t.datetime "scheduled_at"
    t.datetime "finished_at"
    t.string "concurrency_key"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "batch_id"
    t.index ["active_job_id"], name: "index_solid_queue_jobs_on_active_job_id"
    t.index ["batch_id"], name: "index_solid_queue_jobs_on_batch_id"
    t.index ["class_name"], name: "index_solid_queue_jobs_on_class_name"
    t.index ["finished_at"], name: "index_solid_queue_jobs_on_finished_at"
    t.index ["queue_name", "finished_at"], name: "index_solid_queue_jobs_for_filtering"
    t.index ["scheduled_at", "finished_at"], name: "index_solid_queue_jobs_for_alerting"
  end

  create_table "solid_queue_pauses", force: :cascade do |t|
    t.string "queue_name", null: false
    t.datetime "created_at", null: false
    t.index ["queue_name"], name: "index_solid_queue_pauses_on_queue_name", unique: true
  end

  create_table "solid_queue_processes", force: :cascade do |t|
    t.string "kind", null: false
    t.datetime "last_heartbeat_at", null: false
    t.bigint "supervisor_id"
    t.integer "pid", null: false
    t.string "hostname"
    t.text "metadata"
    t.datetime "created_at", null: false
    t.string "name", null: false
    t.index ["last_heartbeat_at"], name: "index_solid_queue_processes_on_last_heartbeat_at"
    t.index ["name", "supervisor_id"], name: "index_solid_queue_processes_on_name_and_supervisor_id", unique: true
    t.index ["supervisor_id"], name: "index_solid_queue_processes_on_supervisor_id"
  end

  create_table "solid_queue_ready_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_ready_executions_on_job_id", unique: true
    t.index ["priority", "job_id"], name: "index_solid_queue_poll_all"
    t.index ["queue_name", "priority", "job_id"], name: "index_solid_queue_poll_by_queue"
  end

  create_table "solid_queue_recurring_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "task_key", null: false
    t.datetime "run_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_recurring_executions_on_job_id", unique: true
    t.index ["task_key", "run_at"], name: "index_solid_queue_recurring_executions_on_task_key_and_run_at", unique: true
  end

  create_table "solid_queue_recurring_tasks", force: :cascade do |t|
    t.string "key", null: false
    t.string "schedule", null: false
    t.string "command", limit: 2048
    t.string "class_name"
    t.text "arguments"
    t.string "queue_name"
    t.integer "priority", default: 0
    t.boolean "static", default: true, null: false
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["key"], name: "index_solid_queue_recurring_tasks_on_key", unique: true
    t.index ["static"], name: "index_solid_queue_recurring_tasks_on_static"
  end

  create_table "solid_queue_scheduled_executions", force: :cascade do |t|
    t.bigint "job_id", null: false
    t.string "queue_name", null: false
    t.integer "priority", default: 0, null: false
    t.datetime "scheduled_at", null: false
    t.datetime "created_at", null: false
    t.index ["job_id"], name: "index_solid_queue_scheduled_executions_on_job_id", unique: true
    t.index ["scheduled_at", "priority", "job_id"], name: "index_solid_queue_dispatch_all"
  end

  create_table "solid_queue_semaphores", force: :cascade do |t|
    t.string "key", null: false
    t.integer "value", default: 1, null: false
    t.datetime "expires_at", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["expires_at"], name: "index_solid_queue_semaphores_on_expires_at"
    t.index ["key", "value"], name: "index_solid_queue_semaphores_on_key_and_value"
    t.index ["key"], name: "index_solid_queue_semaphores_on_key", unique: true
  end

  create_table "users", force: :cascade do |t|
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.datetime "remember_created_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.string "role", default: "customer", null: false
    t.string "first_name"
    t.string "last_name"
    t.string "phone"
    t.text "preferences"
    t.text "event_types"
    t.string "budget_range"
    t.string "location"
    t.string "company_name"
    t.integer "total_bookings", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["budget_range"], name: "index_users_on_budget_range"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["location"], name: "index_users_on_location"
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
  end

  create_table "vendor_categories", force: :cascade do |t|
    t.bigint "vendor_id", null: false
    t.bigint "category_id", null: false
    t.boolean "is_primary", default: false, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["category_id"], name: "index_vendor_categories_on_category_id"
    t.index ["vendor_id", "category_id"], name: "index_vendor_categories_on_vendor_id_and_category_id", unique: true
    t.index ["vendor_id", "is_primary"], name: "index_vendor_categories_on_vendor_id_and_is_primary"
    t.index ["vendor_id"], name: "index_vendor_categories_on_vendor_id"
  end

  create_table "vendor_services", force: :cascade do |t|
    t.bigint "vendor_id", null: false
    t.bigint "service_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["service_id"], name: "index_vendor_services_on_service_id"
    t.index ["vendor_id", "service_id"], name: "index_vendor_services_on_vendor_id_and_service_id", unique: true
    t.index ["vendor_id"], name: "index_vendor_services_on_vendor_id"
  end

  create_table "vendors", force: :cascade do |t|
    t.bigint "user_id", null: false
    t.string "business_name", null: false
    t.text "description"
    t.string "location"
    t.string "phone"
    t.string "website"
    t.string "business_license"
    t.integer "years_experience", default: 0
    t.decimal "average_rating", precision: 3, scale: 2, default: "0.0"
    t.integer "total_reviews", default: 0
    t.decimal "latitude", precision: 10, scale: 6
    t.decimal "longitude", precision: 10, scale: 6
    t.string "verification_status", default: "unverified"
    t.datetime "verified_at"
    t.text "rejection_reason"
    t.integer "favorites_count", default: 0, null: false
    t.string "instagram_handle"
    t.string "facebook_url"
    t.text "cancellation_policy"
    t.decimal "response_time_hours", precision: 5, scale: 2
    t.decimal "completion_rate", precision: 5, scale: 4
    t.string "slug", null: false
    t.jsonb "metadata", default: {}
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "to_tsvector('english'::regconfig, (COALESCE(business_name, ''::character varying))::text)", name: "index_vendors_on_business_name_tsvector", using: :gin
    t.index ["business_name"], name: "index_vendors_on_business_name"
    t.index ["favorites_count"], name: "index_vendors_on_favorites_count"
    t.index ["latitude", "longitude"], name: "index_vendors_on_coordinates"
    t.index ["location"], name: "index_vendors_on_location"
    t.index ["slug"], name: "index_vendors_on_slug", unique: true
    t.index ["user_id"], name: "index_vendors_on_user_id", unique: true
    t.index ["verification_status"], name: "index_vendors_on_verification_status"
    t.check_constraint "completion_rate IS NULL OR completion_rate >= 0::numeric AND completion_rate <= 1.0", name: "check_completion_rate_valid"
    t.check_constraint "response_time_hours IS NULL OR response_time_hours >= 0::numeric", name: "check_response_time_non_negative"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "auth_identities", "users"
  add_foreign_key "availability_slots", "vendors"
  add_foreign_key "booking_messages", "bookings"
  add_foreign_key "booking_messages", "users", column: "sender_id"
  add_foreign_key "bookings", "services"
  add_foreign_key "bookings", "users", column: "customer_id"
  add_foreign_key "bookings", "vendors"
  add_foreign_key "checklist_items", "users"
  add_foreign_key "customer_favorites", "users"
  add_foreign_key "customer_favorites", "vendors"
  add_foreign_key "email_notification_preferences", "users"
  add_foreign_key "in_app_notifications", "users"
  add_foreign_key "portfolio_items", "vendors"
  add_foreign_key "review_votes", "reviews"
  add_foreign_key "review_votes", "users", column: "voter_id"
  add_foreign_key "reviews", "bookings"
  add_foreign_key "reviews", "services"
  add_foreign_key "reviews", "users", column: "customer_id"
  add_foreign_key "reviews", "vendors"
  add_foreign_key "service_categories", "categories"
  add_foreign_key "service_categories", "services"
  add_foreign_key "service_images", "services"
  add_foreign_key "services", "vendors"
  add_foreign_key "solid_queue_batch_executions", "solid_queue_batches", column: "batch_id", on_delete: :cascade
  add_foreign_key "solid_queue_batch_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_blocked_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_claimed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_failed_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_ready_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_recurring_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "solid_queue_scheduled_executions", "solid_queue_jobs", column: "job_id", on_delete: :cascade
  add_foreign_key "vendor_categories", "categories"
  add_foreign_key "vendor_categories", "vendors"
  add_foreign_key "vendor_services", "services"
  add_foreign_key "vendor_services", "vendors"
  add_foreign_key "vendors", "users"
end
