# frozen_string_literal: true

module Auth
  class LoginService
    include Callable

    def initialize(email:, password:)
      @email = email.to_s.strip
      @password = password.to_s
    end

    def call
      if email.blank? || password.blank?
        return Result.failure(status: :bad_request, payload: { error: 'Email and password are required' })
      end

      user = User.find_by(email: email)

      if user&.valid_password?(password)
        user.confirm unless user.confirmed?
        token = JwtService.encode(user_id: user.id, email: user.email, role: user.role)

        Result.success(
          status: :ok,
          payload: {
            message: 'Login successful',
            token: token,
            user: UserSerializer.call(user)
          }
        )
      else
        Result.failure(status: :unauthorized, payload: { error: 'Invalid credentials' })
      end
    end

    private

    attr_reader :email, :password
  end
end
