import { PositionDTO } from "./position";
import { TerritoryTypeDTO } from "./territoryType";

export interface TerritoryDTO {
  id: number;
  code: string;
  name: string;
  territorialAuthorityName?: string;
  territorialAuthorityAddress?: string;
  territorialAuthorityEmail?: string;
  territorialAuthorityLogo?: string;
  scope?: string;
  extent?: any;
  center?: any;
  defaultZoomLevel?: number;
  blocked?: boolean;
  type: TerritoryTypeDTO;
  note?: string;
  legal?: string;
  createdDate: Date;
  taskAvailabilities?:string;
  cartographyAvailabilities?: string;
  positions: Array<PositionDTO>;
  userConfigurations?: string;
  applications?: string;
}
