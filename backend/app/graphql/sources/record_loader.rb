# frozen_string_literal: true

module Sources
  class RecordLoader < GraphQL::Dataloader::Source
    def initialize(model_class)
      super()
      @model_class = model_class
    end

    def fetch(ids)
      records = @model_class.where(id: ids).index_by(&:id)
      ids.map { |id| records[id] }
    end
  end
end
