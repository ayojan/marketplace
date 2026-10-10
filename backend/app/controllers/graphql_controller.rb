# frozen_string_literal: true

class GraphqlController < ApplicationController
  skip_before_action :authenticate_request
  before_action :set_current_user_optional

  # If accessing from outside this domain, nullify the session
  # This allows for outside API access while preventing CSRF attacks,
  # but you'll have to authenticate your user separately
  protect_from_forgery with: :null_session

  def execute
    variables = prepare_variables(params[:variables])
    query = params[:query]
    operation_name = params[:operationName]

    return render json: { errors: [{ message: 'No query string was present' }] } if query.blank?

    context = {
      current_user: @current_user
    }
    result = MarketplaceSchema.execute(query, variables: variables, context: context, operation_name: operation_name)
    render json: result
  rescue GraphQL::ExecutionError => e
    render json: { errors: [{ message: e.message }] }
  rescue StandardError => e
    render json: { errors: [{ message: e.message }] }
  end

  private

  def set_current_user_optional
    return if request.headers['Authorization'].blank?

    @current_user = AuthorizeApiRequest.new(request.headers).call[:user]
  rescue StandardError
    @current_user = nil
  end

  # Handle variables in form data, JSON body, or a blank value
  def prepare_variables(variables_param)
    case variables_param
    when String
      parse_string_variables(variables_param)
    when Hash
      variables_param
    when ActionController::Parameters
      variables_param.to_unsafe_hash # GraphQL-Ruby will validate name and type of incoming variables.
    when nil
      {}
    else
      raise ArgumentError, "Unexpected parameter: #{variables_param}"
    end
  end

  def parse_string_variables(variables_param)
    return {} if variables_param.blank?

    begin
      JSON.parse(variables_param) || {}
    rescue JSON::ParserError => e
      raise GraphQL::ExecutionError, "Invalid JSON in variables parameter: #{e.message}"
    end
  end

  def handle_error_in_development(exception)
    logger.error exception.message
    logger.error exception.backtrace.join("\n")

    render json: { errors: [{ message: exception.message, backtrace: exception.backtrace }], data: {} },
           status: :internal_server_error
  end
end
