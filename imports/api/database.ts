export type IdType = string;

export interface DBEntry {
  _id: IdType;
}

export type OmitDB<T> = Omit<T, keyof DBEntry>;
