import { ResourceDto } from './resource.dto';
import { TreeDto } from './tree.dto';

export class MyResourceDto {
  constructor(tree: TreeDto[], resources: ResourceDto[]) {
    this.tree = tree;
    this.resources = resources;
  }
  tree: TreeDto[];
  resources: ResourceDto[];
}