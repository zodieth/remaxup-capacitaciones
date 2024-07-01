import "next-auth";

declare module "next-auth" {
  /**
   * Extiende los tipos de sesión para incluir los campos personalizados como `user.id`.
   */
  interface Session {
    user?: {
      id?: string;
      role?: string;
      email?: string;
      name?: string;
      image?: string;
      agentId?: string;
    };
  }
}

type Propiedad = {
  id: string;
  title: string;
  slug: string;
  location: object;
  totalRooms: number;
  bathrooms: number;
  price: number;
  priceExposure: boolean;
  currency: {
    value: string;
  };
  expensesPrice: number;
  expensesCurrency: object;
  displayAddress: string;
  internalId: string;
  dimensionLand: number;
  dimensionTotalBuilt: number;
  dimensionCovered: number;
  associate: {
    id: string;
    emails: [
      {
        value: string;
      },
    ];
    name: string;
  };
  listBroker: [];
  type: object;
  operation: object;
  listingStatus: object;
  photos: [
    {
      value: string;
    },
  ];
  addressInfo: string;
  billingFrequency: boolean;
};

// ----------------------------------------------
// type de la api de remax propiedades:

type Maintenance = {
  fee: number;
  type: null | string;
  currency: string;
  code: number;
};

type Address = {
  displayAddress: string;
  streetNumber: string;
  streetName: string;
  postalCode: string;
  countryId: string;
  country: string;
  regionId: string;
  region: string;
  stateId: string;
  state: string;
  subregionId: string;
  subregion: string;
  countyId: string;
  county: string;
  cityId: string;
  city: string;
  neighborhoodId: null | string;
  neighborhood: null | string;
  privatecommunityId: null | string;
  privatecommunity: null | string;
  apartment: string;
  floor: string;
};

type Document = {
  id: string;
  originalName: string;
  type: string;
  cdn: string;
  fileType: string;
  createdAt: string;
  linkDownload: string;
};

type Photo = {
  id: null | string;
  cdn: string;
  fileName: string;
  is360Image: null | boolean;
  prefix: string;
  primary: boolean;
  value: null | string;
  order: number;
  cloudfront: string;
  path: string;
  createdAt: string;
};

type Price = {
  currency: string;
  exposure: string;
  type: string;
  value: number;
};

type Commission = {
  seller: { type: string; value: number };
  buyer: { type: string; value: number };
};

type TransferHistoryItem = {
  associate: string;
  office: string;
  mlsid: string;
  redremaxId: string;
  start: string;
  end: string | null;
};

type ClientData = {
  id: string;
  createdBy: string;
  email: string;
  family: Array<{
    name: string;
    relation: string;
    date: null | string;
  }>;
  mobile: string;
  firstname: string;
  lastname: string;
  birthday: string;
  type: string;
  gender: string;
  status: string;
  origin: string;
  associate: string;
  office: string;
  createdAt: string;
  copyFrom: string;
};

export type PropertydApi = {
  dimensionTotalBuilt: number;
  dimensionCovered: number;
  slug: string;
  currency: {
    value: string;
  };
  id: string;
  price: string;
  expiresOn: string;
  propertyTypeV2: string;
  featureV2: Array<any>;
  yearBuild: number;
  virtualTours: Array<any>;
  aptCredit: boolean;
  professionalUse: boolean;
  commercialUse: boolean;
  buildingTotalUnits: number;
  maintenance: Maintenance;
  status: string;
  statusChanges: string;
  address: Address;
  location: [number, number];
  clients: Array<string>;
  type: string;
  availableDate: string;
  commission: Commission;
  notes: Array<any>;
  dimensions: {
    land: null | number;
    totalBuilt: number;
    covered: number;
    semicovered: number;
    uncovered: null | number;
  };
  propertyCondition: Array<any>;
  contract: string;
  video: string;
  title: string;
  description: string;
  price: Price;
  defaults: {
    currency: string;
    unit: string;
  };
  documents: Array<Document>;
  photos: Array<Photo>;
  photos360: Array<any>;
  blueprints: Array<any>;
  rooms: Array<any>;
  toiletrooms: number;
  bathrooms: number;
  bedrooms: number;
  totalFloors: number;
  totalRooms: number;
  parkingSpaces: null | number;
  financing: boolean;
  remaxCollection: boolean;
  pozo: boolean;
  inPrivateCommunity: boolean;
  billboard: boolean;
  reducedMovility: boolean;
  canPublish: boolean;
  opportunity: boolean;
  staffDirectAprove: boolean;
  associate: string;
  network: string;
  node: string;
  office: string;
  associateQrid: string;
  onemls: {
    nodeId: string;
    networkId: number;
    officeId: number;
    associateId: number;
    listingId: number;
  };
  qrid: string;
  deletedOn: null | string;
  updatedBy: string;
  updatedOn: string;
  createdAt: string;
  publishingPercentage: number;
  associateStatus: string;
  countContacts: number;
  countViews: number;
  publicationQuality: number;
  syndicateAs: {
    version: number;
    versionDate: string;
  };
  mlsid: string;
  transferHistory: Array<TransferHistoryItem>;
  approvedAt: string;
  approvedBy: string;
  priceHistory: Array<{
    date: string;
    price: string;
    currency: string;
    TC: number;
    USD: string;
    ARS: string;
  }>;
  clientsData: Array<ClientData>;
  variacion: number;
  countContactsUnanswered: number;
};

// ----------------------------------------------

// agente

export type Email = {
  type: string;
  value: string;
  primary: boolean;
};

type PhoneNumber = {
  countryCode: string;
  networkPrefix: string;
  number: string;
  formated: string;
  international: string;
  isMobile: boolean;
  type: string;
  value: string;
  directDial: string;
  primary: boolean;
};

type Photo = {
  id: string;
  cdn: string;
  primary: boolean;
  type: string;
  value: string;
  originalName: string;
  fileType: string;
};

type Name = {
  givenName: string;
  familyName: string;
};

type Foreigns = {
  remaxAr: {
    id: number;
    url: string;
  };
  class: string;
};

type OneMLS = {
  nodeId: string;
  networkId: number;
  officeId: number;
  associateId: number;
  nextListingId: number;
};

type Office = {
  id: string;
  network: string;
  node: string;
  // Agrega más campos según sean necesarios
};

type User = {
  id: {
    $id: string;
  };
  profile: string;
  // Agrega más campos según sean necesarios
};

export type Agent = {
  id: string;
  network: string;
  node: string;
  bulletPoints: string[];
  closer: string;
  createdOn: string;
  updatedOn: string;
  name: Name;
  displayName: string;
  emails: Email[];
  foreigns: Foreigns;
  location: any[]; // Define más específicamente si es necesario
  onemls: OneMLS;
  phoneNumbers: PhoneNumber[];
  photos: Photo[];
  role: string;
  title: string;
  remaxCollection: boolean;
  shortId: string;
  status: string;
  thumbnail: string;
  totalListings: number;
  nextActiveSearchId: number;
  listingsLimit: number;
  qrid: string;
  offices: Office[];
  // Agrega más campos según sean necesarios
  user: User;
  ratings: any[]; // Define más específicamente si es necesario
};

// ----------------------------------------------

export type DocumentVariable = {
  id: string;
  name: string;
  value: string;
  description?: string;
  referenceTo?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type DocumentTemplate = {
  id: string;
  title: string;
  description?: string;
  templateBlocks: TemplateBlock[];
  variables: DocumentVariable[];
  createdAt: Date;
  updatedAt: Date;
};

export type DocumentFromTemplate = {
  id: string;
  title: string;
  description?: string;
  content: string;
  propertyId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PropertyCreateDTO = {
  mlsid: string;
  title: string;
  address: string;
  photos: string[];
  isTemporalProperty?: boolean;
};

// TemplateBlock Type
export type TemplateBlock = {
  id: string;
  content: string;
  isDuplicable: boolean;
  index: number;

  documentTemplateId: string;
  documentTemplate: DocumentTemplate;

  variables: DocumentVariable[];

  createdAt: Date;
  updatedAt: Date;
};

// Property Type
export type Property = {
  mlsid: string;
  title: string;
  address: string;
  photos: string; // Almacena JSON serializado

  profiles: Profile[];
  documents: Document[];

  createdAt: Date;
  updatedAt: Date;
};

// Profile Type
export type Profile = {
  id: string;
  name: string;
  description?: string;

  variables: ProfileDocumentVariable[];

  property: Property;
  propertyId: string;

  createdAt: Date;
  updatedAt: Date;
};

// ProfileDocumentVariable Type
export type ProfileDocumentVariable = {
  id: string;
  value: string;

  profile: Profile;
  profileId: string;
  documentVariable: DocumentVariable;
  documentVariableId: string;

  createdAt: Date;
  updatedAt: Date;
};

// Assumed existing types for DocumentTemplate, Document, and DocumentVariable
export type DocumentTemplate = {
  id: string;
  title: string;
  description?: string;
  content?: string;
  category: string;

  variables: DocumentVariable[];
  templateBlocks: TemplateBlock[];

  createdAt: Date;
  updatedAt: Date;
};

export type Document = {
  id: string;
  title: string;
  description?: string;
  content: string;
  category: string;
  createdBy: string;

  propertyId?: string;
  property?: Property;

  createdAt: Date;
  updatedAt: Date;
};

export type DocumentCategory =
  | "AUTORIZACIONES"
  | "CONTRATOS"
  | "INFORMES"
  | "OTROS";
