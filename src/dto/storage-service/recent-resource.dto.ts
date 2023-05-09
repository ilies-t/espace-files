export class RecentResourceDto {
  id: string;
  name: string;
  created_at: string;
  type: 'image' | 'application' | null;
}