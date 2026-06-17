export type Role = 'member' | 'admin' | 'cashier' | 'staff';
export type Status = 'active' | 'inactive' | 'pending';

export interface User {
  id: number;
  firstname: string;
  middlename?: string | null;
  lastname: string;
  suffix?: string | null;
  contact?: string | null;
  address?: string | null;
  birthday?: string | null;
  birthplace?: string | null;
  qr_code?: string | null;
  sex?: 'male' | 'female' | null;
  height?: number | null;
  weight?: number | null;
  email: string;
  username: string;
  profile?: string | null;
  icon?: string | null;
  status: Status;
  role: Role;
  membership_fee?: MembershipFee | null;
  contract?: Contract | null;
  created_at: string;
  updated_at: string;
}

export interface WalkInInfo {
  id: number;
  firstname: string;
  middlename?: string | null;
  lastname: string;
  suffix?: string | null;
  email: string;
  contact: string;
  total_visits: number;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  user_id: number;
  time_in: string;
  time_out?: string | null;
  created_at: string;
  updated_at: string;
}

export interface WalkInAttendance {
  id: number;
  walk_in_id: number;
  time_in: string;
  fee_paid: number;
  assisted_by: number;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  sold: number;
  profile: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: number;
  user_id: number;
  contract_type: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  days_remaining?: number | null;
  is_active?: boolean | null;
  payment?: ContractPayment | null;
  user?: User | null;
  created_at: string;
  updated_at: string;
}

export interface ContractPayment {
  id: number;
  contract_id: number;
  payment_type: 'cash' | 'gcash' | string;
  payment_amount?: number | null;
  or_number?: string | null;
  transaction_id?: string | null;
  payment_status?: string | null;
  trainer_id?: number | null;
  trainer_package?: string | null;
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface MembershipFee {
  id: number;
  user_id: number;
  payment_type: 'cash' | 'gcash';
  payment_amount?: number | null;
  or_number?: string | null;
  transaction_id?: string | null;
  payment_status: 'pending' | 'paid' | 'failed';
  paid_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trainer {
  id: number;
  firstname: string;
  middlename?: string | null;
  lastname: string;
  suffix?: string | null;
  email?: string | null;
  contact?: string | null;
  profile?: string | null;
  address?: string | null;
  total_trained?: number | null;
  sex?: 'male' | 'female' | null;
  created_at: string;
  updated_at: string;
}
