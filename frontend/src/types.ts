export interface User {
  username: string;
  email: string;
  full_name?: string;
  role?: string;
  department?: string;
  profile_picture_url?: string;
}

export interface Project {
  id: string;
  name: string;
  category: string;
  description?: string;
  priority?: string;
  status?: string;
  owner_id: string;
  created_at: string;
}

export interface Task {
  id: string | number;
  title: string;
  status: string;
  priority: string;
  due_date?: string;
  project_id?: string;
  category?: string;
  order: number;
  assignee_id?: string;
  created_at?: string;
}
