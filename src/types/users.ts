export interface User {
  id?: number;
  zalo_id: string;
  name?: string;
  avatar?: string;
  avatar_url?: string;
  phone?: string;
  email?: string;
  address?: string;
  birthday?: string | Date;
  role?: string;
}
