type EmitAction = "CREATE" | "EDIT" | "DELETE";

export type AdditionalRaw = {
  type: "raw";
  value: any;
};

export type AdditionalApi = {
  type: "api";
  endpoint: string;
  path: string;
};

export type CollapsibleListItemAdditionalData = AdditionalRaw | AdditionalApi;

export type CollapsibleListItem = {
  id: string;
  title: string;
  menuOrder: number;
  layer: number;
  additionalData?: CollapsibleListItemAdditionalData;
  canAddAdditionalData?: boolean;
  addEntryButtonText?: string;
  specialType?: string;
  specialActionOnEditClick?: string;
  specialActionOnEditClick?: string;
  static?: boolean;
  next?: CollapsibleListItem[];
};
