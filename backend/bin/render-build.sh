#!/usr/bin/env bash
# exit on error
set -o errexit

# Configure bundler to skip development and test gems, and use parallel downloads
bundle config set --local without 'development test'
bundle config set --local jobs 4
bundle install

# Precompile bootsnap cache for faster boots
bundle exec bootsnap precompile --gemfile app/ lib/

# Precompile ActiveAdmin assets
bundle exec rails assets:precompile
bundle exec rails assets:clean

# Run database migrations
bundle exec rails db:migrate
