const API_URL = '/api/todos';

export interface Todo {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getTodos(): Promise<Todo[]> {
  const res = await fetch(API_URL);
  if (!res.ok) {
    throw new Error('Failed to fetch todos');
  }
  return res.json();
}

export async function createTodo(data: { title: string; description?: string }) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create todo');
  }
  
  return res.json();
}

export async function updateTodo(
  id: string,
  data: Partial<Omit<Todo, '_id' | 'createdAt' | 'updatedAt'>>
) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update todo');
  }
  
  return res.json();
}

export async function deleteTodo(id: string) {
  const res = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete todo');
  }
  
  return res.json();
}
