export interface User {
  id: string;
  name: string;
  role: string;
  avatarUrl?: string;
}

export interface Consultation {
  id: string;
  patientName: string;
  type: string;
  time: string;
  status: 'confirmed' | 'pending' | 'completed';
  date: string;
}

export interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'alert' | 'info' | 'success';
}

export interface StatMetric {
  label: string;
  value: string | number;
  subLabel?: string;
  trend?: 'up' | 'down' | 'neutral';
}
