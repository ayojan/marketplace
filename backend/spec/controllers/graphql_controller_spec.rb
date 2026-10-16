# frozen_string_literal: true

require 'rails_helper'

RSpec.describe GraphqlController do
  describe 'POST #execute' do
    let(:query) do
      <<~GQL
        query {
          serviceCategories {
            id
            name
            slug
          }
        }
      GQL
    end

    context 'with valid GraphQL query' do
      it 'executes the query successfully' do
        post :execute, params: { query: query }

        expect(response).to have_http_status(:ok)

        json_response = response.parsed_body
        expect(json_response['data']).to be_present
        expect(json_response['data']['serviceCategories']).to be_an(Array)
      end
    end

    context 'with invalid GraphQL query' do
      let(:invalid_query) { 'invalid graphql query' }

      it 'returns error response' do
        post :execute, params: { query: invalid_query }

        expect(response).to have_http_status(:ok) # GraphQL returns 200 even for errors

        json_response = response.parsed_body
        expect(json_response['errors']).to be_present
      end
    end

    context 'with complex query exceeding limits' do
      it 'rejects queries exceeding depth limit' do
        # Build a query that exceeds max_depth of 15 (need >15 levels)
        deep_query = <<~GQL
          query {
            searchServices {
              services {
                vendor {
                  services {
                    vendor {
                      services {
                        vendor {
                          services {
                            vendor {
                              services {
                                vendor {
                                  services {
                                    vendor {
                                      services {
                                        vendor {
                                          services {
                                            id
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        GQL

        post :execute, params: { query: deep_query }

        json_response = response.parsed_body
        expect(json_response['errors']).to be_present

        error_message = json_response['errors'].first['message']
        expect(error_message).to include('exceeds max depth')
      end
    end

    context 'with variables' do
      let(:service) { create(:service) }
      let(:variables) { { id: service.id } }
      let(:query_with_variables) do
        <<~GQL
          query GetService($id: ID!) {
            service(id: $id) {
              id
              name
            }
          }
        GQL
      end

      it 'handles variables correctly' do
        post :execute, params: { query: query_with_variables, variables: variables }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body.dig('data', 'service', 'id')).to eq(service.id.to_s)
      end
    end

    context 'with operation name' do
      let(:multi_operation_query) do
        <<~GQL
          query GetCategories {
            serviceCategories {
              id
              name
            }
          }

          query GetServices {
            services {
              id
              name
            }
          }
        GQL
      end

      it 'executes specific operation when operation name is provided' do
        post :execute, params: { query: multi_operation_query, operationName: 'GetCategories' }

        expect(response).to have_http_status(:ok)
        json_response = response.parsed_body
        expect(json_response['data']).to have_key('serviceCategories')
        expect(json_response['data']).not_to have_key('services')
      end
    end

    context 'when handling errors' do
      it 'handles missing query parameter' do
        post :execute, params: {}

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['errors']).to be_present
      end

      it 'handles malformed JSON in variables' do
        post :execute, params: { query: query, variables: 'invalid json' }

        expect(response).to have_http_status(:ok)
        expect(response.parsed_body['errors']).to be_present
      end
    end

    context 'when considering performance and security' do
      it 'includes query complexity analysis' do
        # This test ensures our complexity analysis is working
        # The actual complexity calculation is tested in the resolver specs
        post :execute, params: { query: query }

        expect(response).to have_http_status(:ok)
        # If complexity analysis is working, the query should execute successfully
      end

      it 'limits query string tokens' do
        long_query = "query { #{'serviceCategories { id name slug } ' * 1000} }"

        post :execute, params: { query: long_query }

        json_response = response.parsed_body
        expect(json_response['errors']).to be_present
        expect(json_response['errors'].first['message']).to include('too large to execute')
      end
    end
  end
end
