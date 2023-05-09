export class ResourceDto {
  id: string;
  name: string;
  is_folder: boolean;
  type: 'image' | 'application' | null;
  parent_id: string | null;
  is_public: boolean;
}