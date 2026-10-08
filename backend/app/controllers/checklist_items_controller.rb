# frozen_string_literal: true

class ChecklistItemsController < ApiController
  before_action :authenticate_user!
  before_action :set_checklist_item, only: %i[update destroy toggle]

  # GET /checklist_items
  def index
    items = ChecklistItem.for_user(current_user.id).order(:id)
    render json: { checklist_items: items.map { |item| item_json(item) } }
  end

  # POST /checklist_items
  def create
    item = ChecklistItem.new(checklist_item_params)
    item.user = current_user

    if item.save
      render json: { message: 'Task added successfully', checklist_item: item_json(item) }, status: :created
    else
      render json: { error: 'Failed to create task', details: item.errors.full_messages },
             status: :unprocessable_content
    end
  end

  # PATCH/PUT /checklist_items/:id
  def update
    if @checklist_item.update(checklist_item_params)
      render json: { message: 'Task updated', checklist_item: item_json(@checklist_item) }
    else
      render json: { error: 'Update failed', details: @checklist_item.errors.full_messages },
             status: :unprocessable_content
    end
  end

  # PATCH /checklist_items/:id/toggle
  def toggle
    @checklist_item.update(completed: !@checklist_item.completed)
    render json: { message: 'Task status toggled', checklist_item: item_json(@checklist_item) }
  end

  # DELETE /checklist_items/:id
  def destroy
    @checklist_item.destroy
    render json: { message: 'Task deleted' }
  end

  private

  def set_checklist_item
    @checklist_item = ChecklistItem.find_by(id: params[:id], user_id: current_user.id)
    render json: { error: 'Task not found' }, status: :not_found unless @checklist_item
  end

  def checklist_item_params
    params.require(:checklist_item).permit(:title, :completed, :category, :due_date)
  end

  def item_json(item)
    {
      id: item.id,
      title: item.title,
      completed: item.completed,
      category: item.category,
      due_date: item.due_date,
      created_at: item.created_at
    }
  end
end
